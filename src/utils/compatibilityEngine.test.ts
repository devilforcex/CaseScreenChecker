import { describe, it, expect } from 'vitest';
import { PhoneModel, CompatibilityPair } from '../types';
import {
  calculateToleranceDiff,
  inferDynamicCompatibility,
  getCompatibilityResultsForModel,
  buildPairIndex,
} from './compatibilityEngine';

function makeModel(overrides: Partial<PhoneModel> & { id: string }): PhoneModel {
  const defaults: PhoneModel = {
    id: 'default',
    brand: 'TestBrand',
    name: 'Test Model',
    fullName: 'TestBrand Test Model',
    releaseYear: 2024,
    dimensions: { height: 160, width: 75, thickness: 8, weightG: 190 },
    screen: {
      diagonalIn: 6.5,
      curvature: 'flat',
      notchType: 'punch_hole_center',
      aspectRatio: '20:9',
      hasCurvedEdges: false,
    },
    camera: { shape: 'rectangular_island', lensCount: 3, bumpHeightMm: 1.5, islandWidthMm: 40, islandHeightMm: 30, position: 'top_left' },
    features: {
      hasHeadphoneJack: true,
      fingerprint: 'under_display',
      portType: 'usb_c',
      buttonLayout: 'power_right_vol_right',
    },
    aliases: [],
  };
  return { ...defaults, ...overrides };
}

function makePair(overrides?: Partial<CompatibilityPair>): CompatibilityPair {
  return {
    id: 'pair-test-1',
    sourceModelId: 'a',
    targetModelId: 'b',
    category: 'screen_protector',
    confidenceLevel: 'CONFIRMED_COMPATIBLE',
    confidenceScore: 97,
    fitNotes: 'Test pair fit.',
    isVerifiedByStaff: true,
    ...overrides,
  };
}

describe('buildPairIndex', () => {
  it('groups pairs by sorted model id key', () => {
    const pairs: CompatibilityPair[] = [
      makePair({ id: 'p1', sourceModelId: 'a', targetModelId: 'b' }),
      makePair({ id: 'p2', sourceModelId: 'b', targetModelId: 'a' }), // reversed
      makePair({ id: 'p3', sourceModelId: 'a', targetModelId: 'c' }),
    ];
    const index = buildPairIndex(pairs);

    // a:b has two pairs (both orientations map to same key)
    const keyAB = 'a:b';
    expect(index.get(keyAB)?.length).toBe(2);

    const keyAC = 'a:c';
    expect(index.get(keyAC)?.length).toBe(1);
  });
});

describe('calculateToleranceDiff', () => {
  it('returns zero deltas and full matches for identical models', () => {
    const diff = calculateToleranceDiff(makeModel({ id: 'a' }), makeModel({ id: 'b' }));
    expect(diff.heightDeltaMm).toBe(0);
    expect(diff.widthDeltaMm).toBe(0);
    expect(diff.thicknessDeltaMm).toBe(0);
    expect(diff.screenCurvatureMatch).toBe(true);
    expect(diff.notchMatch).toBe(true);
    expect(diff.cameraShapeMatch).toBe(true);
    expect(diff.buttonAlignmentScore).toBe(100);
  });

  it('computes absolute dimension deltas', () => {
    const a = makeModel({ id: 'a' });
    const b = makeModel({
      id: 'b',
      dimensions: { height: 161.2, width: 76.0, thickness: 8.5 },
    });
    const diff = calculateToleranceDiff(a, b);
    expect(diff.heightDeltaMm).toBeCloseTo(1.2, 2);
    expect(diff.widthDeltaMm).toBeCloseTo(1.0, 2);
    expect(diff.thicknessDeltaMm).toBeCloseTo(0.5, 2);
  });
});

describe('inferDynamicCompatibility', () => {
  it('reports HIGHLY_LIKELY (not CONFIRMED) for identical screen protector fit', () => {
    const res = inferDynamicCompatibility(
      makeModel({ id: 'a' }),
      makeModel({ id: 'b' }),
      'screen_protector'
    );
    expect(res.confidenceScore).toBe(100);
    // Phase 2: inference max is HIGHLY_LIKELY, never CONFIRMED
    expect(res.confidenceLevel).toBe('HIGHLY_LIKELY');
  });

  it('penalizes a large screen diagonal mismatch for protectors', () => {
    const a = makeModel({ id: 'a' });
    const b = makeModel({
      id: 'b',
      screen: {
        diagonalIn: 6.9,
        curvature: 'flat',
        notchType: 'punch_hole_center',
        aspectRatio: '20:9',
        hasCurvedEdges: false,
      },
    });
    const res = inferDynamicCompatibility(a, b, 'screen_protector');
    expect(res.confidenceScore).toBeLessThan(100);
    expect(res.confidenceScore).toBeGreaterThanOrEqual(0);
  });

  it('flags NOT_COMPATIBLE when case dimensions exceed tolerance', () => {
    const a = makeModel({ id: 'a' });
    const b = makeModel({
      id: 'b',
      dimensions: { height: 180, width: 90, thickness: 12 },
    });
    const res = inferDynamicCompatibility(a, b, 'phone_case');
    expect(res.confidenceLevel).toBe('NOT_COMPATIBLE');
  });

  it('never returns CONFIRMED or EXACT from inference', () => {
    const a = makeModel({ id: 'a' });
    const b = makeModel({ id: 'b' });
    const res = inferDynamicCompatibility(a, b, 'screen_protector');
    expect(res.confidenceLevel).not.toBe('CONFIRMED_COMPATIBLE');
    expect(res.confidenceLevel).not.toBe('EXACT_MATCH');
  });

  it('takes aspect ratio into account', () => {
    const a = makeModel({ id: 'a', screen: { diagonalIn: 6.5, curvature: 'flat', notchType: 'punch_hole_center', aspectRatio: '20:9', hasCurvedEdges: false } });
    const b = makeModel({ id: 'b', screen: { diagonalIn: 6.5, curvature: 'flat', notchType: 'punch_hole_center', aspectRatio: '16:9', hasCurvedEdges: false } });
    const res = inferDynamicCompatibility(a, b, 'screen_protector');
    // Should score less than perfect due to aspect ratio mismatch
    expect(res.confidenceScore).toBeLessThan(100);
  });
});

describe('getCompatibilityResultsForModel', () => {
  it('excludes the target model from its own results', () => {
    const target = makeModel({ id: 'target' });
    const models = [target, makeModel({ id: 'other1' }), makeModel({ id: 'other2' })];
    const results = getCompatibilityResultsForModel(target, models, [], 'screen_protector');
    expect(results.length).toBe(2);
    expect(results.every(r => r.candidateModel.id !== 'target')).toBe(true);
  });

  it('sorts results by confidence score descending', () => {
    const target = makeModel({ id: 'target' });
    const models = [target, makeModel({ id: 'a' }), makeModel({ id: 'b' })];
    const results = getCompatibilityResultsForModel(target, models, [], 'screen_protector');
    const scores = results.map(r => r.confidenceScore);
    expect(scores).toEqual([...scores].sort((x, y) => y - x));
  });

  it('uses curated pair from Map index', () => {
    const target = makeModel({ id: 'target' });
    const candidate = makeModel({ id: 'candidate' });
    const models = [target, candidate];
    const pairs: CompatibilityPair[] = [
      makePair({
        sourceModelId: 'target',
        targetModelId: 'candidate',
        confidenceLevel: 'EXACT_MATCH',
        confidenceScore: 100,
        fitNotes: 'Curated pair fit.',
      }),
    ];
    const results = getCompatibilityResultsForModel(target, models, pairs, 'screen_protector');
    expect(results.length).toBe(1);
    expect(results[0].confidenceLevel).toBe('EXACT_MATCH');
    expect(results[0].confidenceScore).toBe(100);
    expect(results[0].pairId).toBeDefined();
  });

  it('returns dual results for all_accessories when no curated pair', () => {
    const target = makeModel({ id: 'target' });
    const candidate = makeModel({ id: 'candidate' });
    const models = [target, candidate];
    const results = getCompatibilityResultsForModel(target, models, [], 'all_accessories');
    // Should have two results (screen + case)
    expect(results.length).toBeGreaterThanOrEqual(2);
    // At least one should mention Screen and one Case
    const screenResult = results.find(r => r.fitNotes?.includes('[Screen]'));
    const caseResult = results.find(r => r.fitNotes?.includes('[Case]'));
    expect(screenResult).toBeDefined();
    expect(caseResult).toBeDefined();
  });

  it('all_accessories with curated all_accessories pair returns single result', () => {
    const target = makeModel({ id: 'target' });
    const candidate = makeModel({ id: 'candidate' });
    const models = [target, candidate];
    const pairs: CompatibilityPair[] = [
      makePair({
        id: 'pair-all',
        sourceModelId: 'target',
        targetModelId: 'candidate',
        category: 'all_accessories',
        confidenceLevel: 'CONFIRMED_COMPATIBLE',
        confidenceScore: 98,
        fitNotes: 'Curated all_accessories pair.',
      }),
    ];
    const results = getCompatibilityResultsForModel(target, models, pairs, 'all_accessories');
    expect(results.length).toBe(1);
    expect(results[0].confidenceLevel).toBe('CONFIRMED_COMPATIBLE');
  });

  it('supports orientation-independent pair lookup (reversed IDs)', () => {
    const target = makeModel({ id: 'target' });
    const candidate = makeModel({ id: 'candidate' });
    const models = [target, candidate];
    // Pair stored with reversed orientation
    const pairs: CompatibilityPair[] = [
      makePair({
        sourceModelId: 'candidate',
        targetModelId: 'target',
        confidenceLevel: 'CONFIRMED_COMPATIBLE',
        confidenceScore: 95,
        fitNotes: 'Reverse pair.',
      }),
    ];
    const results = getCompatibilityResultsForModel(target, models, pairs, 'screen_protector');
    expect(results.length).toBe(1);
    expect(results[0].confidenceLevel).toBe('CONFIRMED_COMPATIBLE');
  });
});