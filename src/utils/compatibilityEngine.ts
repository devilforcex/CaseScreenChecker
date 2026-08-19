/**
 * compatibilityEngine.ts — Physical tolerance engine for cross-model
 * accessory compatibility.
 *
 * Phase 2 improvements:
 * - Config seam (weights extracted to engineConfig.ts)
 * - all_accessories returns dual (screen + case) scores
 * - aspectRatio & islandWidthMm/islandHeightMm factored in
 * - Inference never CONFIRMED_COMPATIBLE / EXACT_MATCH
 * - Pair lookup via Map for O(1) access
 * - i18n-ready fit note helpers
 */

import { PhoneModel, CompatibilityPair, CompatibilityResult, AccessoryCategory, ConfidenceLevel, ToleranceDiff } from '../types';
import { ENGINE_CONFIG } from './engineConfig';

// ─── Pair index Map ──────────────────────────────────────────────────────────

/**
 * Build a Map from model pair key → CompatibilityPair[] for O(1) lookups.
 * Key is `${minId}:${maxId}` (sorted alphabetically).
 */
export function buildPairIndex(pairs: CompatibilityPair[]): Map<string, CompatibilityPair[]> {
  const index = new Map<string, CompatibilityPair[]>();
  for (const p of pairs) {
    const key = makePairKey(p.sourceModelId, p.targetModelId);
    const list = index.get(key) || [];
    list.push(p);
    index.set(key, list);
  }
  return index;
}

function makePairKey(a: string, b: string): string {
  return a < b ? `${a}:${b}` : `${b}:${a}`;
}

// ─── Tolerance calculation ───────────────────────────────────────────────────

export function calculateToleranceDiff(source: PhoneModel, target: PhoneModel): ToleranceDiff {
  const heightDeltaMm = Math.abs(source.dimensions.height - target.dimensions.height);
  const widthDeltaMm = Math.abs(source.dimensions.width - target.dimensions.width);
  const thicknessDeltaMm = Math.abs(source.dimensions.thickness - target.dimensions.thickness);
  const screenDiagonalDeltaIn = Math.abs(source.screen.diagonalIn - target.screen.diagonalIn);

  const screenCurvatureMatch = source.screen.curvature === target.screen.curvature;
  const notchMatch = source.screen.notchType === target.screen.notchType;
  const cameraShapeMatch = source.camera.shape === target.camera.shape && source.camera.position === target.camera.position;

  let cameraIslandFit: 'exact' | 'fits_with_gap' | 'blocked' | 'different_layout' = 'exact';
  if (!cameraShapeMatch) {
    cameraIslandFit = 'different_layout';
  } else if (source.camera.lensCount > target.camera.lensCount) {
    cameraIslandFit = 'blocked';
  } else if (source.camera.lensCount < target.camera.lensCount) {
    cameraIslandFit = 'fits_with_gap';
  }

  const headphoneJackMatch = source.features.hasHeadphoneJack === target.features.hasHeadphoneJack;

  // Button layout scoring
  let buttonAlignmentScore = 100;
  if (source.features.buttonLayout !== target.features.buttonLayout) {
    buttonAlignmentScore = 20;
  }
  if (source.features.fingerprint !== target.features.fingerprint &&
      (source.features.fingerprint === 'side_power_button' || target.features.fingerprint === 'side_power_button')) {
    buttonAlignmentScore -= 30;
  }

  return {
    heightDeltaMm: Number(heightDeltaMm.toFixed(2)),
    widthDeltaMm: Number(widthDeltaMm.toFixed(2)),
    thicknessDeltaMm: Number(thicknessDeltaMm.toFixed(2)),
    screenDiagonalDeltaIn: Number(screenDiagonalDeltaIn.toFixed(2)),
    screenCurvatureMatch,
    notchMatch,
    cameraShapeMatch,
    cameraIslandFit,
    headphoneJackMatch,
    buttonAlignmentScore: Math.max(0, buttonAlignmentScore),
  };
}

// ─── Aspect ratio / island helpers ───────────────────────────────────────────

/**
 * Compute a similarity score (0-100) for screen aspect ratios like "20:9", "19.5:9".
 */
function aspectRatioSimilarity(a: string, b: string): number {
  if (!a || !b) return 100; // no data = no penalty
  if (a === b) return 100;
  const toNum = (s: string): number => {
    const parts = s.split(':');
    if (parts.length !== 2) return NaN;
    return parseFloat(parts[0]) / parseFloat(parts[1]);
  };
  const na = toNum(a);
  const nb = toNum(b);
  if (isNaN(na) || isNaN(nb)) return 100;
  const diff = Math.abs(na - nb);
  if (diff < 0.01) return 100;
  if (diff < 0.05) return 90;
  if (diff < 0.1) return 70;
  return 50;
}

/**
 * Camera island size similarity using islandWidthMm/islandHeightMm when available.
 * Falls back to lensCount-based heuristic.
 */
function cameraIslandSizeScore(source: PhoneModel, target: PhoneModel): number {
  const sw = source.camera.islandWidthMm;
  const sh = source.camera.islandHeightMm;
  const tw = target.camera.islandWidthMm;
  const th = target.camera.islandHeightMm;

  if (sw !== undefined && sh !== undefined && tw !== undefined && th !== undefined) {
    const wDiff = Math.abs(sw - tw);
    const hDiff = Math.abs(sh - th);
    // Within 2mm each direction is considered matching
    const wScore = Math.max(0, 100 - wDiff * 20);
    const hScore = Math.max(0, 100 - hDiff * 20);
    return Math.round((wScore + hScore) / 2);
  }

  // Fallback: lens count heuristic
  const diff = Math.abs(source.camera.lensCount - target.camera.lensCount);
  if (diff === 0) return 100;
  if (diff === 1) return 70;
  return 40;
}

// ─── Inference (dynamic) ────────────────────────────────────────────────────

type ScoredCategory = 'screen_protector' | 'phone_case';

/**
 * Infer dynamic compatibility for a single category.
 * Never returns CONFIRMED_COMPATIBLE or EXACT_MATCH — those are reserved
 * for curated pairs only.
 */
export function inferDynamicCompatibility(
  source: PhoneModel,
  target: PhoneModel,
  category: ScoredCategory
): CompatibilityResult {
  const diff = calculateToleranceDiff(source, target);

  let confidenceScore = 0;
  let confidenceLevel: ConfidenceLevel = 'NOT_COMPATIBLE';
  const fitNotes: string[] = [];
  const caveats: string[] = [];

  if (category === 'screen_protector') {
    let score = 100;

    // Diagonal penalty
    score -= diff.screenDiagonalDeltaIn * ENGINE_CONFIG.screen.diagonalPenaltyPer0_1In * 10;

    // Curvature mismatch
    if (!diff.screenCurvatureMatch) {
      score -= ENGINE_CONFIG.screen.curvatureMismatchPenalty;
      caveats.push(`Curvature mismatch: ${source.screen.curvature} vs ${target.screen.curvature}. Glass may halo or lift at edges.`);
    }

    // Notch mismatch
    if (!diff.notchMatch) {
      if (
        (source.screen.notchType.includes('punch') && target.screen.notchType.includes('teardrop')) ||
        (source.screen.notchType.includes('teardrop') && target.screen.notchType.includes('punch'))
      ) {
        score -= ENGINE_CONFIG.screen.notchPunchTeardropPenalty;
        fitNotes.push('Camera cutout style differs slightly, but optical clearance is generally acceptable.');
      } else if (source.screen.notchType === 'dynamic_island' || target.screen.notchType === 'dynamic_island') {
        score -= ENGINE_CONFIG.screen.notchDynamicIslandPenalty;
        caveats.push('Dynamic Island vs Notch disparity. Front camera cutout will not align accurately.');
      } else {
        score -= ENGINE_CONFIG.screen.notchGenericPenalty;
      }
    } else {
      fitNotes.push('Screen notch and camera cutout geometry match.');
    }

    // Aspect ratio similarity (bonus/penalty)
    const arScore = aspectRatioSimilarity(source.screen.aspectRatio, target.screen.aspectRatio);
    if (arScore < 60) {
      score -= 15;
      caveats.push('Aspect ratio mismatch may affect edge-to-edge glass coverage.');
    }

    confidenceScore = Math.max(0, Math.min(100, Math.round(score)));

    // Inference ceiling: never EXACT/CONFIRMED
    if (confidenceScore >= ENGINE_CONFIG.screen.highLikelyThreshold) {
      confidenceLevel = 'HIGHLY_LIKELY';
      fitNotes.unshift(`High screen glass cross-fit likelihood (Δ ${diff.screenDiagonalDeltaIn}\").`);
    } else if (confidenceScore >= ENGINE_CONFIG.screen.possibleThreshold) {
      confidenceLevel = 'POSSIBLE_WITH_CAUTION';
      caveats.unshift('Usable as an emergency protector; slight millimeter edge gap expected.');
    } else {
      confidenceLevel = 'NOT_COMPATIBLE';
      caveats.unshift('Screen glass dimension or shape mismatch exceeds safe fit margins.');
    }

  } else if (category === 'phone_case') {
    let score = 100;

    // Dimension penalties (chassis fit)
    score -= diff.heightDeltaMm * ENGINE_CONFIG.case.heightPenaltyPerMm;
    score -= diff.widthDeltaMm * ENGINE_CONFIG.case.widthPenaltyPerMm;
    score -= diff.thicknessDeltaMm * ENGINE_CONFIG.case.thicknessPenaltyPerMm;

    if (!diff.cameraShapeMatch) {
      score -= ENGINE_CONFIG.case.cameraShapeMismatchPenalty;
      caveats.push('Camera island geometry does not match. Lenses or flash will likely be obstructed.');
    }

    // Camera island size scoring
    const islandScore = cameraIslandSizeScore(source, target);
    if (islandScore < 60) {
      score -= 20;
      caveats.push('Camera island dimensions differ significantly — cutouts may not align.');
    } else if (islandScore < 80) {
      score -= 10;
    }

    if (diff.buttonAlignmentScore < 80) {
      score -= ENGINE_CONFIG.case.buttonAlignmentPenalty;
      caveats.push('Button layout / fingerprint sensor cutout misalignment.');
    }

    if (source.features.hasHeadphoneJack && !target.features.hasHeadphoneJack) {
      caveats.push('Candidate case lacks 3.5mm audio jack port opening.');
    }

    confidenceScore = Math.max(0, Math.min(100, Math.round(score)));

    // Inference ceiling: never CONFIRMED/EXACT
    if (confidenceScore >= ENGINE_CONFIG.screen.highLikelyThreshold) {
      confidenceLevel = 'HIGHLY_LIKELY';
      fitNotes.push('Chassis dimensions very close. Soft silicone/TPU case expected to fit.');
    } else if (confidenceScore >= ENGINE_CONFIG.case.possibleThreshold) {
      confidenceLevel = 'POSSIBLE_WITH_CAUTION';
      caveats.push('Tight or loose fit. Case button response may require pressure.');
    } else {
      confidenceLevel = 'NOT_COMPATIBLE';
      caveats.unshift('Chassis dimension delta exceeds case molding elasticity.');
    }
  }

  return {
    candidateModel: target,
    category,
    confidenceLevel,
    confidenceScore,
    fitNotes: fitNotes.join(' ') || 'Physical specifications evaluated against dimensional threshold.',
    caveats: caveats.join(' ') || undefined,
    isVerifiedByStaff: false,
    diff,
  };
}

// ─── all_accessories dual path ───────────────────────────────────────────────

/**
 * For the `all_accessories` category, compute screen AND case scores
 * and return two separate CompatibilityResult entries.
 */
function inferAllAccessories(
  source: PhoneModel,
  target: PhoneModel,
  knownPairs: CompatibilityPair[] | undefined,
): CompatibilityResult[] {
  const results: CompatibilityResult[] = [];

  // Check if we have a curated pair covering all_accessories
  if (knownPairs) {
    for (const pair of knownPairs) {
      if (pair.category === 'all_accessories') {
        const diff = calculateToleranceDiff(source, target);
        results.push({
          candidateModel: target,
          category: 'all_accessories' as AccessoryCategory,
          confidenceLevel: pair.confidenceLevel,
          confidenceScore: pair.confidenceScore,
          fitNotes: pair.fitNotes,
          caveats: pair.caveats,
          isVerifiedByStaff: pair.isVerifiedByStaff,
          diff,
          pairId: pair.id,
          evidenceSources: pair.evidenceSources,
        });
        return results; // Curated pair overrides inference
      }
    }
  }

  // No curated all_accessories pair — compute both
  const screenRes = inferDynamicCompatibility(source, target, 'screen_protector');
  const caseRes = inferDynamicCompatibility(source, target, 'phone_case');

  // Dual result: combine into one result if they agree, else two
  results.push({
    ...screenRes,
    category: 'all_accessories' as AccessoryCategory,
    fitNotes: `[Screen] ${screenRes.fitNotes}`,
    caveats: screenRes.caveats,
  });
  results.push({
    ...caseRes,
    category: 'all_accessories' as AccessoryCategory,
    fitNotes: `[Case] ${caseRes.fitNotes}`,
    caveats: caseRes.caveats,
  });

  return results;
}

// ─── Main entry point ────────────────────────────────────────────────────────

/**
 * Retrieves all compatibility results for a target phone model.
 *
 * Handles:
 * - Curated pair override (from Map index)
 * - Dynamic inference for unpaired models
 * - all_accessories dual path (screen + case)
 * - Inference ceiling (never above HIGHLY_LIKELY for dynamic)
 */
export function getCompatibilityResultsForModel(
  targetModel: PhoneModel,
  allModels: PhoneModel[],
  knownPairs: CompatibilityPair[],
  category: AccessoryCategory = 'all_accessories',
): CompatibilityResult[] {
  // Build pair index once
  const pairIndex = buildPairIndex(knownPairs);
  const results: CompatibilityResult[] = [];

  for (const candidate of allModels) {
    if (candidate.id === targetModel.id) continue;

    const pairKey = makePairKey(targetModel.id, candidate.id);
    const matchingPairs = pairIndex.get(pairKey);

    if (matchingPairs && matchingPairs.length > 0) {
      // Filter pairs relevant to the requested category
      const relevantPairs = matchingPairs.filter(
        p => category === 'all_accessories' || p.category === 'all_accessories' || p.category === category
      );

      if (relevantPairs.length > 0) {
        // Use curated pairs — these CAN be EXACT/CONFIRMED
        for (const pair of relevantPairs) {
          const diff = calculateToleranceDiff(targetModel, candidate);
          results.push({
            candidateModel: candidate,
            category: pair.category,
            confidenceLevel: pair.confidenceLevel,
            confidenceScore: pair.confidenceScore,
            fitNotes: pair.fitNotes,
            caveats: pair.caveats,
            isVerifiedByStaff: pair.isVerifiedByStaff,
            diff,
            pairId: pair.id,
            evidenceSources: pair.evidenceSources,
          });
        }
        continue; // Skip inference for this candidate — we have curated data
      }
    }

    // No curated pair — use dynamic inference
    if (category === 'all_accessories') {
      const dualResults = inferAllAccessories(targetModel, candidate, matchingPairs);
      results.push(...dualResults);
    } else {
      const evalCategory = category as ScoredCategory;
      const dynamicRes = inferDynamicCompatibility(targetModel, candidate, evalCategory);
      if (dynamicRes.confidenceScore >= ENGINE_CONFIG.minDynamicScore) {
        results.push(dynamicRes);
      }
    }
  }

  // Sort by confidence score descending
  return results.sort((a, b) => b.confidenceScore - a.confidenceScore);
}