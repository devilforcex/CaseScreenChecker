import { describe, it, expect } from 'vitest';
import { PhoneModel } from '../types';
import { normalizeQuery, fuzzySearchModels, createModelSearchIndex, searchModelIndex } from './modelSearch';

function makeModel(id: string, overrides?: Partial<PhoneModel>): PhoneModel {
  return {
    id,
    brand: 'Samsung',
    name: 'Galaxy A05s',
    fullName: 'Samsung Galaxy A05s',
    releaseYear: 2023,
    dimensions: { height: 168, width: 77.8, thickness: 8.8, weightG: 194 },
    screen: { diagonalIn: 6.7, curvature: 'flat', notchType: 'waterdrop_u', aspectRatio: '20:9', hasCurvedEdges: false },
    camera: { shape: 'individual_rings', lensCount: 3, bumpHeightMm: 1.4, position: 'top_left' },
    features: { hasHeadphoneJack: true, fingerprint: 'side_power_button', portType: 'usb_c', buttonLayout: 'power_right_vol_right' },
    aliases: ['SM-A057F', 'SM-A057M'],
    ...overrides,
  };
}

describe('normalizeQuery', () => {
  it('strips leading brand name', () => {
    expect(normalizeQuery('Samsung Galaxy A05s')).toBe('galaxy a05s');
    expect(normalizeQuery('Apple iPhone 14')).toBe('iphone 14');
    expect(normalizeQuery('Xiaomi Redmi Note 13')).toBe('redmi note 13');
  });

  it('collapses whitespace and separators', () => {
    expect(normalizeQuery('a 05 s')).toBe('a 05 s');
    expect(normalizeQuery('SM-A057F')).toBe('sm a057f');
    expect(normalizeQuery('Galaxy  A05s')).toBe('galaxy a05s');
  });

  it('lowercases', () => {
    expect(normalizeQuery('A05S')).toBe('a05s');
  });

  it('returns empty string for whitespace input', () => {
    expect(normalizeQuery('   ')).toBe('');
  });
});

describe('fuzzySearchModels', () => {
  const models: PhoneModel[] = [
    makeModel('samsung-a05s', {
      name: 'Galaxy A05s',
      aliases: ['SM-A057F', 'SM-A057M'],
    }),
    makeModel('samsung-a15', {
      name: 'Galaxy A15 4G/5G',
      aliases: ['SM-A155F', 'SM-A156B'],
    }),
    makeModel('samsung-a14-4g', {
      name: 'Galaxy A14 4G',
      aliases: ['SM-A145F'],
    }),
    makeModel('samsung-s24', {
      brand: 'Samsung',
      name: 'Galaxy S24',
      aliases: ['SM-S921B'],
    }),
    makeModel('apple-iphone-14', {
      brand: 'Apple',
      name: 'iPhone 14',
      aliases: ['A2882', 'A2649'],
    }),
    makeModel('xiaomi-redmi-note-13', {
      brand: 'Xiaomi',
      name: 'Redmi Note 13 5G',
      aliases: ['2312DRAABG'],
    }),
  ];

  it('returns all models when query is empty', () => {
    const results = fuzzySearchModels(models, '');
    expect(results.length).toBe(models.length);
  });

  it('exact alias match returns scored 100', () => {
    const results = fuzzySearchModels(models, 'SM-A057F');
    expect(results.length).toBeGreaterThanOrEqual(1);
    const top = results[0];
    expect(top.model.name).toBe('Galaxy A05s');
    expect(top.score).toBe(100);
    expect(top.matchType).toBe('exact_alias');
  });

  it('starts with name is second priority', () => {
    const results = fuzzySearchModels(models, 'A05s');
    expect(results.length).toBeGreaterThanOrEqual(1);
    expect(results[0].model.name).toBe('Galaxy A05s');
  });

  it('model code fuzzy (Levenshtein) works for short codes', () => {
    const results = fuzzySearchModels(models, 'SM-A057G'); // one char off
    expect(results.length).toBeGreaterThanOrEqual(1);
    const a05sResult = results.find(r => r.model.id === 'samsung-a05s');
    expect(a05sResult).toBeDefined();
    expect(a05sResult!.score).toBeGreaterThanOrEqual(80);
  });

  it('searches across brand, name, and aliases', () => {
    // "iphone" should match Apple iPhone 14 by brand+name
    const results = fuzzySearchModels(models, 'iphone 14');
    expect(results.some(r => r.model.id === 'apple-iphone-14')).toBe(true);
  });

  it('filters by minimum score', () => {
    const all = fuzzySearchModels(models, 'xyz-not-exists', 1);
    expect(all.length).toBe(0);
  });

  it('sorts by descending score', () => {
    const results = fuzzySearchModels(models, 'A05s');
    const scores = results.map(r => r.score);
    // The top score should be highest
    expect(scores[0]).toBeGreaterThanOrEqual(scores[scores.length - 1]);
  });

  it('handles partial codes like A14', () => {
    const results = fuzzySearchModels(models, 'A14');
    expect(results.some(r => r.model.id === 'samsung-a14-4g')).toBe(true);
  });

  it('does not confuse A15 with A14', () => {
    const results = fuzzySearchModels(models, 'A15');
    const topId = results[0].model.id;
    expect(topId).toBe('samsung-a15');
  });

  it('uses a reusable index without changing ranking', () => {
    const index = createModelSearchIndex(models);
    const indexed = searchModelIndex(index, 'SM-A057F');
    expect(indexed[0].model.id).toBe('samsung-a05s');
    expect(indexed[0].score).toBe(100);
  });
});
