import { describe, it, expect } from 'vitest';
import { PhoneModel } from '../types';
import {
  calculateToleranceDiff,
  inferDynamicCompatibility,
  getCompatibilityResultsForModel,
} from './compatibilityEngine';

function makeModel(overrides: Partial<PhoneModel> & { id: string }): PhoneModel {
  const { id, ...rest } = overrides;
  return {
    id,
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
    camera: { shape: 'rectangular_island', lensCount: 3, bumpHeightMm: 1.5, position: 'top_left' },
    features: {
      hasHeadphoneJack: true,
      fingerprint: 'under_display',
      portType: 'usb_c',
      buttonLayout: 'power_right_vol_right',
    },
    aliases: [],
    ...rest,
  };
}

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
  it('reports CONFIRMED_COMPATIBLE for an identical screen protector fit', () => {
    const res = inferDynamicCompatibility(
      makeModel({ id: 'a' }),
      makeModel({ id: 'b' }),
      'screen_protector'
    );
    expect(res.confidenceScore).toBe(100);
    expect(res.confidenceLevel).toBe('CONFIRMED_COMPATIBLE');
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
});
