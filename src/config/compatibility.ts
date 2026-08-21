import type { ConfidenceLevel } from '../types';

/**
 * Centralized, typed thresholds for the deterministic compatibility engine.
 * These values are deliberately separate from staff-verified relationships.
 */
export const COMPATIBILITY_SCORING = {
  screenProtector: {
    diagonalPenaltyPerInch: 200,
    curvatureMismatchPenalty: 35,
    minorNotchMismatchPenalty: 10,
    dynamicIslandMismatchPenalty: 30,
    notchMismatchPenalty: 15,
    highlyLikelyScore: 75,
    possibleWithCautionScore: 50,
  },
  phoneCase: {
    heightPenaltyPerMm: 30,
    widthPenaltyPerMm: 40,
    thicknessPenaltyPerMm: 35,
    cameraMismatchPenalty: 40,
    buttonMismatchPenalty: 30,
    highlyLikelyScore: 75,
    possibleWithCautionScore: 45,
    highlyLikelyMaxHeightDeltaMm: 0.8,
    highlyLikelyMaxWidthDeltaMm: 0.6,
  },
  resultInclusionScore: 40,
} as const;

/** Dynamic calculations are hypotheses, not staff-confirmed fit evidence. */
export function inferredConfidenceLevel(score: number, category: 'screen_protector' | 'phone_case'): ConfidenceLevel {
  const thresholds = category === 'screen_protector'
    ? COMPATIBILITY_SCORING.screenProtector
    : COMPATIBILITY_SCORING.phoneCase;
  if (score >= thresholds.highlyLikelyScore) return 'HIGHLY_LIKELY';
  if (score >= thresholds.possibleWithCautionScore) return 'POSSIBLE_WITH_CAUTION';
  return 'NOT_COMPATIBLE';
}
