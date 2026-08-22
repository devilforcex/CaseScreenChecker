import { describe, expect, it } from 'vitest';
import { chooseBestFallbackRecord, type PhoneSpecsApiRecord } from './phoneResearch';

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
});
