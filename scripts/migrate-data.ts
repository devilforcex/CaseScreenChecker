import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const supabase = createClient(process.env.VITE_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

import { INITIAL_PHONE_MODELS, INITIAL_COMPATIBILITY_PAIRS } from '../src/data/phoneDatabase.js';

// Classify an alias into a valid alias_kind enum value:
// model_number: alphanumeric manufacturer codes like SM-A057F, A2633, XT2423-1
// rebrand: names that indicate the phone is a rebrand/twin/clone of another
// common_name: marketing/retail names like "Galaxy A05s 4G", "Pixel 8 5G"
function classifyAlias(alias: string): string {
  // Rebrands: contains "twin", "clone", "rebrand", or "Edition"
  if (/twin|clone|rebrand/i.test(alias)) return 'rebrand';
  // Model numbers: starts with uppercase letters followed by digits/dashes, or pure alphanum codes
  if (/^[A-Z]{1,3}[\d-]/.test(alias) || /^iPhone\d/.test(alias) || /^\d{4,}[A-Z]/.test(alias)) return 'model_number';
  // Everything else is a common name
  return 'common_name';
}

async function run() {
  console.log('=== Phase 3 Migration ===');
  console.log(`Source: ${INITIAL_PHONE_MODELS.length} models, ${INITIAL_COMPATIBILITY_PAIRS.length} pairs`);

  // 1. Fetch accessory categories
  const { data: categories, error: catErr } = await supabase.from('accessory_categories').select('*');
  if (catErr) { console.error('FATAL: cannot fetch categories:', catErr); return; }
  const screenProtectorCat = categories!.find(c => c.slug === 'screen_protector');
  const caseCat = categories!.find(c => c.slug === 'phone_case');
  console.log(`Categories loaded: screen_protector=${screenProtectorCat?.id}, phone_case=${caseCat?.id}`);

  // 2. Fetch existing models for idempotency
  const { data: existingModels } = await supabase.from('phone_models').select('id, slug');
  const slugToUuid = new Map<string, string>();
  for (const m of existingModels || []) {
    slugToUuid.set(m.slug, m.id);
  }

  // 3. Upsert phone_models
  let modelOk = 0, modelFail = 0;
  for (const model of INITIAL_PHONE_MODELS) {
    let uuid = slugToUuid.get(model.id);
    if (!uuid) {
      uuid = crypto.randomUUID();
      slugToUuid.set(model.id, uuid);
    }

    const row: Record<string, unknown> = {
      id: uuid,
      slug: model.id,
      brand: model.brand,
      name: model.name,
      full_name: model.fullName,
      release_year: model.releaseYear,
      // dimensions
      height_mm: model.dimensions.height,
      width_mm: model.dimensions.width,
      thickness_mm: model.dimensions.thickness,
      weight_g: model.dimensions.weightG ?? null,
      // screen — diagonalIn is NOT NULL in the remote schema
      screen_diagonal_in: model.screen.diagonalIn,
      screen_curvature: model.screen.curvature,
      notch_type: model.screen.notchType,
      aspect_ratio: model.screen.aspectRatio,
      has_curved_edges: model.screen.hasCurvedEdges,
      // camera
      camera_shape: model.camera.shape,
      camera_lens_count: model.camera.lensCount,
      camera_bump_height_mm: model.camera.bumpHeightMm,
      camera_island_width_mm: model.camera.islandWidthMm ?? null,
      camera_island_height_mm: model.camera.islandHeightMm ?? null,
      camera_position: model.camera.position,
      // features
      has_headphone_jack: model.features.hasHeadphoneJack,
      fingerprint_sensor: model.features.fingerprint,
      port_type: model.features.portType,
      button_layout: model.features.buttonLayout,
      notes: model.notes ?? null,
      image_url: model.imageUrl ?? null
    };

    const { error } = await supabase.from('phone_models').upsert(row, { onConflict: 'id' });
    if (error) {
      console.error(`  FAIL phone_model "${model.id}": ${error.message}`);
      modelFail++;
    } else {
      modelOk++;
    }

    // aliases
    if (model.aliases && model.aliases.length > 0) {
      for (const alias of model.aliases) {
        const { data: existAlias } = await supabase.from('phone_aliases')
          .select('id').eq('model_id', uuid).eq('alias', alias);
        if (!existAlias || existAlias.length === 0) {
          const { error: aliasErr } = await supabase.from('phone_aliases').insert({
            id: crypto.randomUUID(),
            model_id: uuid,
            alias,
            alias_kind: classifyAlias(alias)
          });
          if (aliasErr) console.error(`  FAIL alias "${alias}": ${aliasErr.message}`);
        }
      }
    }
  }
  console.log(`phone_models: ${modelOk} OK, ${modelFail} FAIL`);

  // 4. Upsert compatibility_relationships
  let relOk = 0, relFail = 0, evOk = 0;
  for (const pair of INITIAL_COMPATIBILITY_PAIRS) {
    const sourceUuid = slugToUuid.get(pair.sourceModelId);
    const targetUuid = slugToUuid.get(pair.targetModelId);
    if (!sourceUuid || !targetUuid) {
      console.warn(`  SKIP pair "${pair.id}": cannot map sourceModelId="${pair.sourceModelId}" or targetModelId="${pair.targetModelId}"`);
      relFail++;
      continue;
    }

    // Determine category IDs
    const catIds: string[] = [];
    if (pair.category === 'all_accessories') {
      if (screenProtectorCat) catIds.push(screenProtectorCat.id);
      if (caseCat) catIds.push(caseCat.id);
    } else if (pair.category === 'screen_protector' && screenProtectorCat) {
      catIds.push(screenProtectorCat.id);
    } else if (pair.category === 'phone_case' && caseCat) {
      catIds.push(caseCat.id);
    }

    for (const catId of catIds) {
      const { data: existRel } = await supabase.from('compatibility_relationships')
        .select('id')
        .eq('device_a_id', sourceUuid)
        .eq('device_b_id', targetUuid)
        .eq('category_id', catId);

      let relId: string;
      if (existRel && existRel.length > 0) {
        relId = existRel[0].id;
      } else {
        relId = crypto.randomUUID();
        const { error: rErr } = await supabase.from('compatibility_relationships').insert({
          id: relId,
          device_a_id: sourceUuid,
          device_b_id: targetUuid,
          category_id: catId,
          relationship_status: 'compatible',
          confidence_level: pair.confidenceLevel,
          confidence_score: pair.confidenceScore,
          fit_notes: pair.fitNotes,
          caveats: pair.caveats ?? null,
          origin: pair.isVerifiedByStaff ? 'manual' : 'system',
          verification_status: pair.isVerifiedByStaff ? 'verified' : 'unverified',
          verified_by: null,  // verifiedBy is a UUID FK to profiles, store the name in fit_notes instead
          verified_at: pair.verifiedDate ?? null
        });
        if (rErr) {
          console.error(`  FAIL relationship "${pair.id}" cat=${catId}: ${rErr.message}`);
          relFail++;
          continue;
        }
        relOk++;
      }

      // evidence
      if (pair.evidenceSources && pair.evidenceSources.length > 0) {
        for (const ev of pair.evidenceSources) {
          const { data: existEv } = await supabase.from('compatibility_evidence')
            .select('id')
            .eq('relationship_id', relId)
            .eq('source_type', ev.type);
          if (!existEv || existEv.length === 0) {
            const { error: evErr } = await supabase.from('compatibility_evidence').insert({
              id: crypto.randomUUID(),
              relationship_id: relId,
              source_type: ev.type,
              source_title: ev.title,
              source_url: ev.url ?? null,
              evidence_text: ev.snippet,
              confidence_score: pair.confidenceScore
            });
            if (evErr) {
              console.error(`  FAIL evidence for "${pair.id}": ${evErr.message}`);
            } else {
              evOk++;
            }
          }
        }
      }
    }
  }
  console.log(`compatibility_relationships: ${relOk} OK, ${relFail} FAIL`);
  console.log(`compatibility_evidence: ${evOk} inserted`);

  // 5. Final counts
  const { count: mCount } = await supabase.from('phone_models').select('*', { count: 'exact', head: true });
  const { count: aCount } = await supabase.from('phone_aliases').select('*', { count: 'exact', head: true });
  const { count: rCount } = await supabase.from('compatibility_relationships').select('*', { count: 'exact', head: true });
  const { count: eCount } = await supabase.from('compatibility_evidence').select('*', { count: 'exact', head: true });
  console.log('\n=== Remote DB Counts ===');
  console.log(`phone_models: ${mCount}`);
  console.log(`phone_aliases: ${aCount}`);
  console.log(`compatibility_relationships: ${rCount}`);
  console.log(`compatibility_evidence: ${eCount}`);
  console.log('=== Migration Complete ===');
}

run();
