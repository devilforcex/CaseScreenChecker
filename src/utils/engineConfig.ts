/**
 * engineConfig.ts — Config seam for compatibility engine weights and thresholds.
 *
 * All magic numbers from the scoring functions live here so they can be
 * tuned without touching the logic.
 */

export const ENGINE_CONFIG = {
  /**
   * Screen protector scoring weights.
   */
  screen: {
    /** Points deducted per 0.1in of diagonal difference */
    diagonalPenaltyPer0_1In: 20,
    /** Points lost when curvature doesn't match */
    curvatureMismatchPenalty: 35,
    /** Punch ↔ Teardrop mismatch (minor) */
    notchPunchTeardropPenalty: 10,
    /** Dynamic Island vs anything else */
    notchDynamicIslandPenalty: 30,
    /** Generic notch mismatch */
    notchGenericPenalty: 15,

    /** Threshold for max inference level (never EXACT/CONFIRMED) */
    inferenceMaxScore: 89,
    /** Thresholds for inference levels */
    highLikelyThreshold: 75,
    possibleThreshold: 50,
  },

  /**
   * Phone case scoring weights.
   */
  case: {
    /** Points deducted per mm of height difference */
    heightPenaltyPerMm: 30,
    /** Points deducted per mm of width difference */
    widthPenaltyPerMm: 40,
    /** Points deducted per mm of thickness difference */
    thicknessPenaltyPerMm: 35,
    /** Camera shape mismatch penalty */
    cameraShapeMismatchPenalty: 40,
    /** Button alignment penalty */
    buttonAlignmentPenalty: 30,

    /** Thresholds */
    highLikelyHeightMm: 0.8,
    highLikelyWidthMm: 0.6,
    possibleThreshold: 45,
  },

  /**
   * Tolerance thresholds for "tight fit" indicators.
   */
  tolerance: {
    /** Height delta considered "tight" (mm) */
    heightTightThreshold: 0.5,
    /** Width delta considered "tight" (mm) */
    widthTightThreshold: 0.4,
  },

  /**
   * Inference level ceiling — inference can never produce a level
   * higher than this maximum. Only curated pairs can be EXACT/CONFIRMED.
   */
  inferenceMaxLevel: 'HIGHLY_LIKELY' as const,

  /**
   * Minimum confidence score to include a dynamic result.
   */
  minDynamicScore: 40,
};