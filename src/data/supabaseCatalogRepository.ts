import type { SupabaseClient } from '@supabase/supabase-js';
import { compatibilityPairSchema, phoneModelSchema } from '../validation/schemas';
import type { AccessoryCategory, CompatibilityPair, PhoneModel } from '../types';
import type { Database } from '../types/database';

type Client = SupabaseClient<Database>;
type PhoneRow = Database['public']['Tables']['phone_models']['Row'];
type AliasRow = Database['public']['Tables']['phone_aliases']['Row'];
type RelationshipRow = Database['public']['Tables']['compatibility_relationships']['Row'];

const toNumber = (value: number | null, fallback = 0) => value === null ? fallback : Number(value);

function mapPhoneModel(row: PhoneRow, aliases: AliasRow[]): PhoneModel {
  return phoneModelSchema.parse({
    id: row.slug, brand: row.brand, name: row.name, fullName: row.full_name, releaseYear: row.release_year ?? 0,
    dimensions: { height: toNumber(row.height_mm), width: toNumber(row.width_mm), thickness: toNumber(row.thickness_mm), weightG: row.weight_g === null ? undefined : toNumber(row.weight_g) },
    screen: { diagonalIn: toNumber(row.screen_diagonal_in), curvature: row.screen_curvature, notchType: row.notch_type, aspectRatio: row.aspect_ratio ?? 'unknown', hasCurvedEdges: row.has_curved_edges },
    camera: { shape: row.camera_shape, lensCount: row.camera_lens_count, bumpHeightMm: toNumber(row.camera_bump_height_mm), islandWidthMm: row.camera_island_width_mm === null ? undefined : toNumber(row.camera_island_width_mm), islandHeightMm: row.camera_island_height_mm === null ? undefined : toNumber(row.camera_island_height_mm), position: row.camera_position },
    features: { hasHeadphoneJack: row.has_headphone_jack, fingerprint: row.fingerprint_sensor, portType: row.port_type, buttonLayout: row.button_layout },
    aliases: aliases.filter((alias) => alias.model_id === row.id).map((alias) => alias.alias), notes: row.notes ?? undefined, imageUrl: row.image_url ?? undefined,
  });
}

function categoryFromSlug(slug: string): AccessoryCategory | null { return slug === 'screen_protector' || slug === 'phone_case' ? slug : null; }

function mapRelationship(row: RelationshipRow, modelSlugs: Map<string, string>, categorySlugs: Map<string, string>): CompatibilityPair | null {
  const category = categoryFromSlug(categorySlugs.get(row.category_id) ?? '');
  const sourceModelId = modelSlugs.get(row.device_a_id);
  const targetModelId = modelSlugs.get(row.device_b_id);
  if (!category || !sourceModelId || !targetModelId) return null;
  return compatibilityPairSchema.parse({
    id: row.id, sourceModelId, targetModelId, category, confidenceLevel: row.confidence_level, confidenceScore: row.confidence_score,
    fitNotes: row.fit_notes, caveats: row.caveats ?? undefined,
    // verification_status, never confidence or origin, is the sole trust signal.
    isVerifiedByStaff: row.verification_status === 'verified', verifiedBy: row.verified_by ?? undefined, verifiedDate: row.verified_at ?? undefined,
  });
}

export interface PublicCatalog { models: PhoneModel[]; compatibilityPairs: CompatibilityPair[]; }

/** Evidence is staff-only under RLS, so the anonymous catalog does not request it. */
export async function fetchPublicCatalog(client: Client, signal: AbortSignal): Promise<PublicCatalog> {
  const [modelsResult, aliasesResult, categoriesResult, relationshipsResult] = await Promise.all([
    client.from('phone_models').select('*').order('brand').order('name').abortSignal(signal), client.from('phone_aliases').select('*').abortSignal(signal),
    client.from('accessory_categories').select('*').eq('is_active', true).abortSignal(signal),
    client.from('compatibility_relationships').select('*').eq('verification_status', 'verified').abortSignal(signal),
  ]);
  if (modelsResult.error) throw modelsResult.error;
  if (aliasesResult.error) throw aliasesResult.error;
  if (categoriesResult.error) throw categoriesResult.error;
  if (relationshipsResult.error) throw relationshipsResult.error;
  const modelSlugs = new Map(modelsResult.data.map((model) => [model.id, model.slug]));
  const categorySlugs = new Map(categoriesResult.data.map((category) => [category.id, category.slug]));
  const models = modelsResult.data.map((model) => mapPhoneModel(model, aliasesResult.data));
  const compatibilityPairs = relationshipsResult.data.map((relationship) => mapRelationship(relationship, modelSlugs, categorySlugs)).filter((pair): pair is CompatibilityPair => pair !== null);
  return { models, compatibilityPairs };
}

export async function fetchStaffRole(client: Client, userId: string): Promise<'staff' | 'admin' | null> {
  const { data, error } = await client.from('profiles').select('role').eq('id', userId).maybeSingle();
  if (error) return null;
  const role = data?.role;
  return role === 'admin' || role === 'staff' ? role : null;
}

function phoneModelInsert(model: PhoneModel) {
  return {
    slug: model.id,
    brand: model.brand,
    name: model.name,
    full_name: model.fullName,
    release_year: model.releaseYear,
    height_mm: model.dimensions.height,
    width_mm: model.dimensions.width,
    thickness_mm: model.dimensions.thickness,
    weight_g: model.dimensions.weightG ?? null,
    screen_diagonal_in: model.screen.diagonalIn,
    screen_curvature: model.screen.curvature,
    notch_type: model.screen.notchType,
    aspect_ratio: model.screen.aspectRatio,
    has_curved_edges: model.screen.hasCurvedEdges,
    camera_shape: model.camera.shape,
    camera_lens_count: model.camera.lensCount,
    camera_bump_height_mm: model.camera.bumpHeightMm,
    camera_island_width_mm: model.camera.islandWidthMm ?? null,
    camera_island_height_mm: model.camera.islandHeightMm ?? null,
    camera_position: model.camera.position,
    has_headphone_jack: model.features.hasHeadphoneJack,
    fingerprint_sensor: model.features.fingerprint,
    port_type: model.features.portType,
    button_layout: model.features.buttonLayout,
    notes: model.notes ?? null,
    image_url: model.imageUrl ?? null,
  };
}

/** Staff-only mutation. The RPC keeps model + aliases in one transaction. */
export async function createPhoneModel(client: Client, model: PhoneModel): Promise<void> {
  const validModel = phoneModelSchema.parse(model);
  const aliases = [...new Set(validModel.aliases.map((alias) => alias.trim()).filter(Boolean))];
  const { error } = await client.rpc('create_phone_model_with_aliases', {
    model_payload: phoneModelInsert(validModel),
    aliases,
  });
  if (error) throw error;
}

/** Creates a relationship and records its in-store staff-test evidence together. */
export async function createCompatibilityPair(client: Client, pair: CompatibilityPair): Promise<void> {
  const validPair = compatibilityPairSchema.parse(pair);
  const categorySlugs: AccessoryCategory[] = validPair.category === 'all_accessories'
    ? ['screen_protector', 'phone_case']
    : [validPair.category];
  const [modelsResult, categoriesResult] = await Promise.all([
    client.from('phone_models').select('id, slug').in('slug', [validPair.sourceModelId, validPair.targetModelId]),
    client.from('accessory_categories').select('id, slug').in('slug', categorySlugs),
  ]);
  if (modelsResult.error) throw modelsResult.error;
  if (categoriesResult.error) throw categoriesResult.error;
  const modelIds = new Map(modelsResult.data.map((model) => [model.slug, model.id]));
  const deviceAId = modelIds.get(validPair.sourceModelId);
  const deviceBId = modelIds.get(validPair.targetModelId);
  if (!deviceAId || !deviceBId || categoriesResult.data.length !== categorySlugs.length) {
    throw new Error('The selected model or accessory category is no longer available. Refresh and retry.');
  }

  for (const category of categoriesResult.data) {
    const { data: relationship, error } = await client
      .from('compatibility_relationships')
      .insert({
        device_a_id: deviceAId,
        device_b_id: deviceBId,
        category_id: category.id,
        relationship_status: validPair.confidenceLevel === 'NOT_COMPATIBLE' ? 'not_compatible' : 'compatible',
        confidence_level: validPair.confidenceLevel,
        confidence_score: validPair.confidenceScore,
        fit_notes: validPair.fitNotes,
        caveats: validPair.caveats ?? null,
        origin: 'manual',
        verification_status: validPair.isVerifiedByStaff ? 'verified' : 'candidate',
        verified_at: validPair.isVerifiedByStaff ? new Date().toISOString() : null,
      })
      .select('id')
      .single();
    if (error) throw error;

    const { error: evidenceError } = await client.from('compatibility_evidence').insert({
      relationship_id: relationship.id,
      source_type: 'staff_test',
      source_title: validPair.verifiedBy || 'In-store staff test',
      claim: validPair.fitNotes,
      evidence_text: validPair.caveats ?? null,
      confidence_score: validPair.confidenceScore,
      verification_state: validPair.isVerifiedByStaff ? 'verified' : 'candidate',
    });
    if (evidenceError) throw evidenceError;
  }
}
