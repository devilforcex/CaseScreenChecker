import { describe, expect, it } from 'vitest';
import { findPriorityCatalogCandidates } from './priorityCatalog';
import type { PhoneModel } from '../types';

const catalogModel: PhoneModel = {
  id: 'apple-iphone-14', brand: 'Apple', name: 'iPhone 14', fullName: 'Apple iPhone 14', releaseYear: 2022,
  dimensions: { height: 146.7, width: 71.5, thickness: 7.8 },
  screen: { diagonalIn: 6.1, curvature: 'flat', notchType: 'wide_notch', aspectRatio: '19.5:9', hasCurvedEdges: false },
  camera: { shape: 'square_island', lensCount: 2, bumpHeightMm: 1.5, position: 'top_left' },
  features: { hasHeadphoneJack: false, fingerprint: 'none', portType: 'lightning', buttonLayout: 'power_right_vol_left' }, aliases: ['A2882'],
};

describe('priority catalog candidates', () => {
  it('recognises a common missing model by its model code', () => {
    const results = findPriorityCatalogCandidates('SM-A525F', []);
    expect(results[0]?.fullName).toBe('Samsung Galaxy A52');
  });

  it('keeps an existing catalog model out of the review queue', () => {
    const results = findPriorityCatalogCandidates('iPhone 14', [catalogModel]);
    expect(results.map((result) => result.fullName)).not.toContain('Apple iPhone 14');
  });

  it('does not present a non-matching model as a candidate', () => {
    expect(findPriorityCatalogCandidates('not-a-phone', [])).toEqual([]);
  });
});
