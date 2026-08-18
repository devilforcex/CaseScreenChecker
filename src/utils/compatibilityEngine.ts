import { PhoneModel, CompatibilityPair, CompatibilityResult, AccessoryCategory, ConfidenceLevel, ToleranceDiff } from '../types';

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
    score -= diff.screenDiagonalDeltaIn * 200;

    // Curvature mismatch
    if (!diff.screenCurvatureMatch) {
      score -= 35;
      caveats.push(`Curvature mismatch: ${source.screen.curvature} vs ${target.screen.curvature}. Glass may halo or lift at edges.`);
    }

    // Notch mismatch
    if (!diff.notchMatch) {
      if ((source.screen.notchType.includes('punch') && target.screen.notchType.includes('teardrop')) ||
          (source.screen.notchType.includes('teardrop') && target.screen.notchType.includes('punch'))) {
        score -= 10;
        fitNotes.push('Camera cutout style differs slightly, but optical clearance is generally acceptable.');
      } else if (source.screen.notchType === 'dynamic_island' || target.screen.notchType === 'dynamic_island') {
        score -= 30;
        caveats.push('Dynamic Island vs Notch disparity. Front camera cutout will not align accurately.');
      } else {
        score -= 15;
      }
    } else {
      fitNotes.push('Screen notch and camera cutout geometry match.');
    }

    confidenceScore = Math.max(0, Math.min(100, Math.round(score)));

    if (confidenceScore >= 95 && diff.screenDiagonalDeltaIn < 0.05) {
      confidenceLevel = 'CONFIRMED_COMPATIBLE';
      fitNotes.unshift(`Screen diagonal (${target.screen.diagonalIn}") matches with Δ ${diff.screenDiagonalDeltaIn}".`);
    } else if (confidenceScore >= 75) {
      confidenceLevel = 'HIGHLY_LIKELY';
      fitNotes.unshift(`High screen glass cross-fit likelihood with minor marginal tolerance.`);
    } else if (confidenceScore >= 50) {
      confidenceLevel = 'POSSIBLE_WITH_CAUTION';
      caveats.unshift('Usable as an emergency protector; slight millimeter edge gap expected.');
    } else {
      confidenceLevel = 'NOT_COMPATIBLE';
      caveats.unshift('Screen glass dimension or shape mismatch exceeds safe fit margins.');
    }

  } else if (category === 'phone_case') {
    // Phone case scoring
    let score = 100;

    // Dimension penalties (Chassis fit)
    score -= diff.heightDeltaMm * 30;
    score -= diff.widthDeltaMm * 40;
    score -= diff.thicknessDeltaMm * 35;

    if (!diff.cameraShapeMatch) {
      score -= 40;
      caveats.push('Camera island geometry does not match. Lenses or flash will likely be obstructed.');
    }

    if (diff.buttonAlignmentScore < 80) {
      score -= 30;
      caveats.push('Button layout / fingerprint sensor cutout misalignment.');
    }

    if (source.features.hasHeadphoneJack && !target.features.hasHeadphoneJack) {
      caveats.push('Candidate case lacks 3.5mm audio jack port opening.');
    }

    confidenceScore = Math.max(0, Math.min(100, Math.round(score)));

    if (confidenceScore >= 92 && diff.heightDeltaMm <= 0.4 && diff.widthDeltaMm <= 0.3) {
      confidenceLevel = 'CONFIRMED_COMPATIBLE';
      fitNotes.push('Chassis perimeter within tight flexible TPU case tolerance.');
    } else if (confidenceScore >= 75 && diff.heightDeltaMm <= 0.8 && diff.widthDeltaMm <= 0.6) {
      confidenceLevel = 'HIGHLY_LIKELY';
      fitNotes.push('Chassis dimensions very close. Soft silicone/TPU case expected to fit.');
    } else if (confidenceScore >= 45) {
      confidenceLevel = 'POSSIBLE_WITH_CAUTION';
      caveats.push('Tight or loose fit. Case button response may require pressure.');
    } else {
      confidenceLevel = 'NOT_COMPATIBLE';
      caveats.unshift('Chassis dimension delta exceeds case molding elasticity.');
    }
  } else {
    // All accessories
    confidenceScore = 70;
    confidenceLevel = 'POSSIBLE_WITH_CAUTION';
    fitNotes.push('General accessory evaluation.');
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
    const matchingPair = knownPairs.find(
      p => (p.sourceModelId === targetModel.id && p.targetModelId === candidate.id) ||
           (p.sourceModelId === candidate.id && p.targetModelId === targetModel.id)
    );

    if (matchingPair) {
      if (category !== 'all_accessories' && matchingPair.category !== 'all_accessories' && matchingPair.category !== category) {
        // Evaluate dynamic for the requested category
        const dynamicRes = inferDynamicCompatibility(targetModel, candidate, category);
        results.push({
          ...dynamicRes,
          pairId: matchingPair.id
        });
      } else {
        const diff = calculateToleranceDiff(targetModel, candidate);
        results.push({
          candidateModel: candidate,
          category: matchingPair.category,
          confidenceLevel: matchingPair.confidenceLevel,
          confidenceScore: matchingPair.confidenceScore,
          fitNotes: matchingPair.fitNotes,
          caveats: matchingPair.caveats,
          isVerifiedByStaff: matchingPair.isVerifiedByStaff,
          diff,
          pairId: matchingPair.id,
          evidenceSources: matchingPair.evidenceSources
        });
      }
    } else {
      // Dynamic calculation
      const evalCategory = category === 'all_accessories' ? 'screen_protector' : category;
      const dynamicRes = inferDynamicCompatibility(targetModel, candidate, evalCategory);
      if (dynamicRes.confidenceScore >= 40) {
        results.push(dynamicRes);
      }
    }
  }

  // Sort results by confidenceScore descending
  return results.sort((a, b) => b.confidenceScore - a.confidenceScore);
}
