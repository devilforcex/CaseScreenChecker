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
    screen: {
      diagonalIn: toNumber(row.screen_diagonal_in), curvature: row.screen_curvature, notchType: row.notch_type,
      aspectRatio: row.aspect_ratio ?? 'unknown', hasCurvedEdges: row.has_curved_edges,
      widthMm: row.screen_width_mm === null ? undefined : toNumber(row.screen_width_mm),
      heightMm: row.screen_height_mm === null ? undefined : toNumber(row.screen_height_mm),
      cornerRadiusMm: row.screen_corner_radius_mm === null ? undefined : toNumber(row.screen_corner_radius_mm),
      cutoutWidthMm: row.screen_cutout_width_mm === null ? undefined : toNumber(row.screen_cutout_width_mm),
      cutoutHeightMm: row.screen_cutout_height_mm === null ? undefined : toNumber(row.screen_cutout_height_mm),
      edgeToEdgeCompatible: row.edge_to_edge_compatible ?? undefined,
    },
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
    screen_width_mm: model.screen.widthMm ?? null,
    screen_height_mm: model.screen.heightMm ?? null,
    screen_corner_radius_mm: model.screen.cornerRadiusMm ?? null,
    screen_cutout_width_mm: model.screen.cutoutWidthMm ?? null,
    screen_cutout_height_mm: model.screen.cutoutHeightMm ?? null,
    edge_to_edge_compatible: model.screen.edgeToEdgeCompatible ?? null,
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
  const { error } = await client.rpc('create_compatibility_relationship_with_evidence', {
    pair_payload: {
      source_model_id: validPair.sourceModelId, target_model_id: validPair.targetModelId, category: validPair.category,
      confidence_level: validPair.confidenceLevel, confidence_score: validPair.confidenceScore, fit_notes: validPair.fitNotes,
      caveats: validPair.caveats ?? '', is_verified: validPair.isVerifiedByStaff,
      evidence_title: validPair.verifiedBy || 'In-store staff test', evidence_type: 'staff_test',
    },
  });
  if (error) throw error;
}
