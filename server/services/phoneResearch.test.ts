import { describe, expect, it } from 'vitest';
import { chooseBestFallbackRecord, chooseBestGsmarenaSearchResult, parseDimensions, type PhoneSpecsApiRecord } from './phoneResearch';

const record = (modelName: string, model = modelName): PhoneSpecsApiRecord => ({
  brand: 'Samsung',
  model,
  model_name: modelName,
  dimensions: '162.3 x 79.0 x 8.6 mm',
  screen_size: '6.8',
});

describe('structured phone research matching', () => {
  it('prefers an exact model over a broader product variant', () => {
    const exact = record('Samsung Galaxy S25');
    const ultra = record('Samsung Galaxy S25 Ultra');
    expect(chooseBestFallbackRecord([ultra, exact], 'Samsung Galaxy S25')).toBe(exact);
  });

  it('rejects unrelated records instead of returning the first API result', () => {
    expect(chooseBestFallbackRecord([record('Samsung Galaxy S24 Ultra')], 'Samsung A05s')).toBeUndefined();
  });

  it('rejects incomplete physical dimensions instead of inventing defaults', () => {
    expect(parseDimensions('6.7 inch display')).toBeUndefined();
    expect(parseDimensions('162.3 x 79.0 x 8.6 mm')).toEqual({ height: 162.3, width: 79, thickness: 8.6 });
  });
});

describe('GSMArena research matching', () => {
  it('prefers the exact title over a broader variant', () => {
    const exact = { path: 'samsung_galaxy_s25-13600', title: 'Samsung Galaxy S25' };
    const ultra = { path: 'samsung_galaxy_s25_ultra-13601', title: 'Samsung Galaxy S25 Ultra' };
    expect(chooseBestGsmarenaSearchResult([ultra, exact], 'Samsung Galaxy S25')).toBe(exact);
  });

  it('rejects unrelated GSMArena results', () => {
    expect(chooseBestGsmarenaSearchResult([
      { path: 'samsung_galaxy_s24-1', title: 'Samsung Galaxy S24 Ultra' },
    ], 'Samsung Galaxy A05s')).toBeUndefined();
  });
});
