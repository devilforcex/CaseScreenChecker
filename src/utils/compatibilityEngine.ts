import { PhoneModel, CompatibilityPair, CompatibilityResult, AccessoryCategory, ConfidenceLevel, ToleranceDiff } from '../types';
import { COMPATIBILITY_SCORING, inferredConfidenceLevel } from '../config/compatibility';

/**
 * Calculates physical dimensional tolerance differences between two phone models.
 */
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
  if (source.features.fingerprint !== target.features.fingerprint && (source.features.fingerprint === 'side_power_button' || target.features.fingerprint === 'side_power_button')) {
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
    buttonAlignmentScore: Math.max(0, buttonAlignmentScore)
  };
}

/**
 * Dynamic physics-based compatibility inference when a static pair is not in the database.
 */
export function inferDynamicCompatibility(
  source: PhoneModel,
  target: PhoneModel,
  category: AccessoryCategory
): CompatibilityResult {
  const diff = calculateToleranceDiff(source, target);

  let confidenceScore = 0;
  let confidenceLevel: ConfidenceLevel = 'NOT_COMPATIBLE';
  const fitNotes: string[] = [];
  const caveats: string[] = [];

  if (category === 'screen_protector') {
    // Screen protector scoring
    let score = 100;

    // Diagonal penalty (20 pts per 0.1 inch)
    score -= diff.screenDiagonalDeltaIn * COMPATIBILITY_SCORING.screenProtector.diagonalPenaltyPerInch;

    // Curvature mismatch
    if (!diff.screenCurvatureMatch) {
      score -= COMPATIBILITY_SCORING.screenProtector.curvatureMismatchPenalty;
      caveats.push(`Curvature mismatch: ${source.screen.curvature} vs ${target.screen.curvature}. Glass may halo or lift at edges.`);
    }

    // Notch mismatch
    if (!diff.notchMatch) {
      if ((source.screen.notchType.includes('punch') && target.screen.notchType.includes('teardrop')) ||
          (source.screen.notchType.includes('teardrop') && target.screen.notchType.includes('punch'))) {
        score -= COMPATIBILITY_SCORING.screenProtector.minorNotchMismatchPenalty;
        fitNotes.push('Camera cutout style differs slightly, but optical clearance is generally acceptable.');
      } else if (source.screen.notchType === 'dynamic_island' || target.screen.notchType === 'dynamic_island') {
        score -= COMPATIBILITY_SCORING.screenProtector.dynamicIslandMismatchPenalty;
        caveats.push('Dynamic Island vs Notch disparity. Front camera cutout will not align accurately.');
      } else {
        score -= COMPATIBILITY_SCORING.screenProtector.notchMismatchPenalty;
      }
    } else {
      fitNotes.push('Screen notch and camera cutout geometry match.');
    }

    confidenceScore = Math.max(0, Math.min(100, Math.round(score)));

    confidenceLevel = inferredConfidenceLevel(confidenceScore, 'screen_protector');
    if (confidenceLevel === 'HIGHLY_LIKELY') {
      fitNotes.unshift(`High screen glass cross-fit likelihood with minor marginal tolerance.`);
    } else if (confidenceLevel === 'POSSIBLE_WITH_CAUTION') {
      caveats.unshift('Usable as an emergency protector; slight millimeter edge gap expected.');
    } else {
      confidenceLevel = 'NOT_COMPATIBLE';
      caveats.unshift('Screen glass dimension or shape mismatch exceeds safe fit margins.');
    }

  } else if (category === 'phone_case') {
    // Phone case scoring
    let score = 100;

    // Dimension penalties (Chassis fit)
    score -= diff.heightDeltaMm * COMPATIBILITY_SCORING.phoneCase.heightPenaltyPerMm;
    score -= diff.widthDeltaMm * COMPATIBILITY_SCORING.phoneCase.widthPenaltyPerMm;
    score -= diff.thicknessDeltaMm * COMPATIBILITY_SCORING.phoneCase.thicknessPenaltyPerMm;

    if (!diff.cameraShapeMatch) {
      score -= COMPATIBILITY_SCORING.phoneCase.cameraMismatchPenalty;
      caveats.push('Camera island geometry does not match. Lenses or flash will likely be obstructed.');
    }

    if (diff.buttonAlignmentScore < 80) {
      score -= COMPATIBILITY_SCORING.phoneCase.buttonMismatchPenalty;
      caveats.push('Button layout / fingerprint sensor cutout misalignment.');
    }

    if (source.features.hasHeadphoneJack && !target.features.hasHeadphoneJack) {
      caveats.push('Candidate case lacks 3.5mm audio jack port opening.');
    }

    confidenceScore = Math.max(0, Math.min(100, Math.round(score)));

    confidenceLevel = inferredConfidenceLevel(confidenceScore, 'phone_case');
    if (
      confidenceLevel === 'HIGHLY_LIKELY' &&
      diff.heightDeltaMm <= COMPATIBILITY_SCORING.phoneCase.highlyLikelyMaxHeightDeltaMm &&
      diff.widthDeltaMm <= COMPATIBILITY_SCORING.phoneCase.highlyLikelyMaxWidthDeltaMm
    ) {
      fitNotes.push('Chassis dimensions very close. Soft silicone/TPU case expected to fit.');
    } else if (confidenceLevel === 'HIGHLY_LIKELY') {
      confidenceLevel = 'POSSIBLE_WITH_CAUTION';
      caveats.push('Dimensions are outside the preferred soft-case tolerance.');
    } else if (confidenceLevel === 'POSSIBLE_WITH_CAUTION') {
      caveats.push('Tight or loose fit. Case button response may require pressure.');
    } else {
      confidenceLevel = 'NOT_COMPATIBLE';
      caveats.unshift('Chassis dimension delta exceeds case molding elasticity.');
    }
  } else {
    const screenResult = inferDynamicCompatibility(source, target, 'screen_protector');
    const caseResult = inferDynamicCompatibility(source, target, 'phone_case');
    // A general recommendation is only as reliable as its weaker accessory fit.
    confidenceScore = Math.min(screenResult.confidenceScore, caseResult.confidenceScore);
    confidenceLevel = inferredConfidenceLevel(confidenceScore, 'phone_case');
    fitNotes.push(`Screen protector: ${screenResult.fitNotes} Phone case: ${caseResult.fitNotes}`);
    caveats.push(...[screenResult.caveats, caseResult.caveats].filter((item): item is string => Boolean(item)));
  }

  return {
    candidateModel: target,
    category,
    confidenceLevel,
    confidenceScore,
    fitNotes: fitNotes.join(' ') || 'Physical specifications evaluated against dimensional threshold.',
    caveats: caveats.join(' ') || undefined,
    isVerifiedByStaff: false,
    diff
  };
}

function pairAppliesToCategory(pair: CompatibilityPair, category: AccessoryCategory): boolean {
  if (category === 'all_accessories') return pair.category === 'all_accessories';
  return pair.category === category || pair.category === 'all_accessories';
}

function pairPriority(pair: CompatibilityPair, category: AccessoryCategory): number {
  if (pair.category === category) return 2;
  if (pair.category === 'all_accessories') return 1;
  return 0;
}

function resultFromPair(pair: CompatibilityPair, candidate: PhoneModel, source: PhoneModel): CompatibilityResult {
  const isStaffCurated = pair.isVerifiedByStaff;
  const inferredLevel = inferredConfidenceLevel(
    pair.confidenceScore,
    pair.category === 'phone_case' ? 'phone_case' : 'screen_protector'
  );
  return {
    candidateModel: candidate,
    category: pair.category,
    confidenceLevel: isStaffCurated ? pair.confidenceLevel : inferredLevel,
    confidenceScore: pair.confidenceScore,
    fitNotes: pair.fitNotes,
    caveats: pair.caveats,
    isVerifiedByStaff: isStaffCurated,
    diff: calculateToleranceDiff(source, candidate),
    pairId: pair.id,
    evidenceSources: pair.evidenceSources,
  };
}

/**
 * Searches and retrieves all compatibility results for a target phone model.
 */
export function getCompatibilityResultsForModel(
  targetModel: PhoneModel,
  allModels: PhoneModel[],
  knownPairs: CompatibilityPair[],
  category: AccessoryCategory = 'all_accessories'
): CompatibilityResult[] {
  const results: CompatibilityResult[] = [];

  for (const candidate of allModels) {
    if (candidate.id === targetModel.id) continue;

    // Check if there is an authoritative pair in database
    const matchingPair = knownPairs
      .filter(p =>
        ((p.sourceModelId === targetModel.id && p.targetModelId === candidate.id) ||
          (p.sourceModelId === candidate.id && p.targetModelId === targetModel.id)) &&
        pairAppliesToCategory(p, category)
      )
      .sort((a, b) => pairPriority(b, category) - pairPriority(a, category))[0];

    if (matchingPair) {
      results.push(resultFromPair(matchingPair, candidate, targetModel));
    } else {
      // Dynamic calculation
      const dynamicRes = inferDynamicCompatibility(targetModel, candidate, category);
      if (dynamicRes.confidenceScore >= COMPATIBILITY_SCORING.resultInclusionScore) {
        results.push(dynamicRes);
      }
    }
  }

  // Sort results by confidenceScore descending
  return results.sort((a, b) => b.confidenceScore - a.confidenceScore);
}
