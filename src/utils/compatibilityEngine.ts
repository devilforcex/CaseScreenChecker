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
  const screenWidthDeltaMm = source.screen.widthMm !== undefined && target.screen.widthMm !== undefined
    ? Math.abs(source.screen.widthMm - target.screen.widthMm) : undefined;
  const screenHeightDeltaMm = source.screen.heightMm !== undefined && target.screen.heightMm !== undefined
    ? Math.abs(source.screen.heightMm - target.screen.heightMm) : undefined;
  const screenCornerRadiusDeltaMm = source.screen.cornerRadiusMm !== undefined && target.screen.cornerRadiusMm !== undefined
    ? Math.abs(source.screen.cornerRadiusMm - target.screen.cornerRadiusMm) : undefined;

  const screenCurvatureMatch = source.screen.curvature === target.screen.curvature;
  const notchMatch = source.screen.notchType === target.screen.notchType;
  const screenGeometryComplete = screenWidthDeltaMm !== undefined && screenHeightDeltaMm !== undefined;
  const sourceCutoutKnown = source.screen.cutoutWidthMm !== undefined && source.screen.cutoutHeightMm !== undefined;
  const targetCutoutKnown = target.screen.cutoutWidthMm !== undefined && target.screen.cutoutHeightMm !== undefined;
  const hasIncompatibleCutoutType = !notchMatch && (
    source.screen.notchType === 'dynamic_island' || target.screen.notchType === 'dynamic_island' ||
    source.screen.notchType === 'wide_notch' || target.screen.notchType === 'wide_notch'
  );
  const hasIncompatibleCutoutSize = sourceCutoutKnown && targetCutoutKnown && (
    Math.abs(source.screen.cutoutWidthMm! - target.screen.cutoutWidthMm!) > 1.5 ||
    Math.abs(source.screen.cutoutHeightMm! - target.screen.cutoutHeightMm!) > 1.5
  );
  const screenCutoutFit: ToleranceDiff['screenCutoutFit'] = hasIncompatibleCutoutType || hasIncompatibleCutoutSize
    ? 'blocked' : notchMatch ? 'exact' : sourceCutoutKnown && targetCutoutKnown ? 'compatible' : 'unknown';
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
    screenWidthDeltaMm: screenWidthDeltaMm === undefined ? undefined : Number(screenWidthDeltaMm.toFixed(2)),
    screenHeightDeltaMm: screenHeightDeltaMm === undefined ? undefined : Number(screenHeightDeltaMm.toFixed(2)),
    screenCornerRadiusDeltaMm: screenCornerRadiusDeltaMm === undefined ? undefined : Number(screenCornerRadiusDeltaMm.toFixed(2)),
    screenCurvatureMatch,
    notchMatch,
    screenGeometryComplete,
    screenCutoutFit,
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

  let confidenceScore: number;
  let confidenceLevel: ConfidenceLevel;
  const fitNotes: string[] = [];
  const caveats: string[] = [];

  if (category === 'screen_protector') {
    // Screen protector scoring is deliberately geometry-first. A matching diagonal
    // alone is not evidence that tempered glass will fit the active display.
    let score = 100;
    const geometryMissing = !diff.screenGeometryComplete;
    const aspectRatioDelta = ratioDelta(source.screen.aspectRatio, target.screen.aspectRatio);

    score -= diff.screenDiagonalDeltaIn * COMPATIBILITY_SCORING.screenProtector.diagonalPenaltyPerInch;
    if (!diff.screenCurvatureMatch) {
      return blockedScreenResult(target, diff, 'Display curvature differs. Edge-to-edge glass can lift or leave unsafe edge gaps.');
    }
    if (diff.screenCutoutFit === 'blocked') {
      return blockedScreenResult(target, diff, 'Front camera/notch cutout is incompatible with this protector.');
    }
    if (diff.screenWidthDeltaMm !== undefined && diff.screenHeightDeltaMm !== undefined) {
      if (diff.screenWidthDeltaMm > COMPATIBILITY_SCORING.screenProtector.maxCautionWidthDeltaMm ||
          diff.screenHeightDeltaMm > COMPATIBILITY_SCORING.screenProtector.maxCautionHeightDeltaMm) {
        return blockedScreenResult(target, diff, 'Measured display width or height exceeds the safe protector tolerance.');
      }
      score -= diff.screenWidthDeltaMm * COMPATIBILITY_SCORING.screenProtector.screenWidthPenaltyPerMm;
      score -= diff.screenHeightDeltaMm * COMPATIBILITY_SCORING.screenProtector.screenHeightPenaltyPerMm;
      fitNotes.push('Measured display width and height are within the screen-fit tolerance.');
    } else {
      score = Math.min(score, COMPATIBILITY_SCORING.screenProtector.missingGeometryScoreCap);
      caveats.push('Display width and height are missing. Measure the glass before sale.');
    }
    if (aspectRatioDelta !== undefined && aspectRatioDelta > 0.015) {
      score -= COMPATIBILITY_SCORING.screenProtector.aspectRatioMismatchPenalty;
      caveats.push('Display aspect ratio differs; verify the top and bottom edge clearance.');
    }
    if (diff.screenCornerRadiusDeltaMm !== undefined) {
      if (diff.screenCornerRadiusDeltaMm > COMPATIBILITY_SCORING.screenProtector.maxCornerRadiusDeltaMm) {
        return blockedScreenResult(target, diff, 'Display corner radius differs too much for full-cover glass.');
      }
      score -= diff.screenCornerRadiusDeltaMm * COMPATIBILITY_SCORING.screenProtector.cornerRadiusPenaltyPerMm;
    }
    if (source.screen.edgeToEdgeCompatible !== undefined && target.screen.edgeToEdgeCompatible !== undefined &&
        source.screen.edgeToEdgeCompatible !== target.screen.edgeToEdgeCompatible) {
      score -= COMPATIBILITY_SCORING.screenProtector.edgeToEdgeMismatchPenalty;
      caveats.push('Edge-to-edge coverage differs; use a non-full-cover protector or test physically.');
    }
    if (diff.screenCutoutFit === 'exact') fitNotes.push('Front camera cutout geometry matches.');
    if (diff.screenCutoutFit === 'compatible') caveats.push('Cutout dimensions are close but not identical; inspect camera clearance.');

    confidenceScore = Math.max(0, Math.min(100, Math.round(score)));
    confidenceLevel = inferredConfidenceLevel(confidenceScore, 'screen_protector');
    if (geometryMissing && confidenceLevel === 'HIGHLY_LIKELY') confidenceLevel = 'POSSIBLE_WITH_CAUTION';
    if (confidenceLevel === 'HIGHLY_LIKELY') {
      fitNotes.unshift('High screen-glass cross-fit likelihood from measured display geometry.');
    } else if (confidenceLevel === 'POSSIBLE_WITH_CAUTION') {
      caveats.unshift('Physical counter check required before sale; do not mark as verified without evidence.');
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
    requiresPhysicalCheck: category === 'screen_protector',
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
    requiresPhysicalCheck: !isStaffCurated,
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
  return results.sort((a, b) => {
    const verifiedPriority = Number(b.isVerifiedByStaff) - Number(a.isVerifiedByStaff);
    return verifiedPriority || b.confidenceScore - a.confidenceScore || a.candidateModel.fullName.localeCompare(b.candidateModel.fullName);
  });
}

function ratioDelta(first: string, second: string): number | undefined {
  const parse = (value: string) => {
    const match = /^(\d+(?:\.\d+)?)\s*:\s*(\d+(?:\.\d+)?)$/.exec(value.trim());
    return match && Number(match[2]) !== 0 ? Number(match[1]) / Number(match[2]) : undefined;
  };
  const a = parse(first); const b = parse(second);
  return a === undefined || b === undefined ? undefined : Math.abs(a - b) / Math.max(a, b);
}

function blockedScreenResult(candidateModel: PhoneModel, diff: ToleranceDiff, caveat: string): CompatibilityResult {
  return {
    candidateModel, category: 'screen_protector', confidenceLevel: 'NOT_COMPATIBLE', confidenceScore: 0,
    fitNotes: 'Screen protector fit was blocked by a critical display-geometry check.', caveats: caveat,
    isVerifiedByStaff: false, requiresPhysicalCheck: true, diff,
  };
}
