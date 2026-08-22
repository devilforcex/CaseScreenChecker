/**
 * Tests for the client-side research cache.
 *
 * Uses localStorage mock via vi.stubGlobal for Node environment.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { PhoneModel } from '../types';
import {
  saveResearchToCache,
  getResearchFromCache,
  saveNotFoundToCache,
  isQueryNotFoundCached,
  isModelInCatalog,
  cleanExpiredEntries,
  getCacheSize,
} from './researchCache';

// Mock localStorage for Node environment
function createMockStorage(): Storage {
  let store: Record<string, string> = {};
  return {
    getItem(key: string): string | null { return store[key] ?? null; },
    setItem(key: string, value: string): void { store[key] = value; },
    removeItem(key: string): void { delete store[key]; },
    clear(): void { store = {}; },
    get length(): number { return Object.keys(store).length; },
    key(index: number): string | null { return Object.keys(store)[index] ?? null; },
  };
}

function makeModel(overrides?: Partial<PhoneModel> & { id: string }): PhoneModel {
  return {
    id: overrides?.id || 'test-model',
    brand: 'TestBrand',
    name: 'Test Model',
    fullName: 'TestBrand Test Model',
    releaseYear: 2024,
    dimensions: { height: 160, width: 75, thickness: 8 },
    screen: { diagonalIn: 6.5, curvature: 'flat', notchType: 'punch_hole_center', aspectRatio: '20:9', hasCurvedEdges: false },
    camera: { shape: 'rectangular_island', lensCount: 3, bumpHeightMm: 1.5, position: 'top_left' },
    features: { hasHeadphoneJack: true, fingerprint: 'side_power_button', portType: 'usb_c', buttonLayout: 'power_right_vol_right' },
    aliases: [],
    ...overrides,
  };
}

describe('researchCache', () => {
  beforeEach(() => {
    const mockStore = createMockStorage();
    vi.stubGlobal('localStorage', mockStore);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('saves and retrieves a model from cache', () => {
    const model = makeModel({ id: 'samsung-a06' });
    saveResearchToCache(model, 'Samsung Galaxy A06');

    const cached = getResearchFromCache('Samsung Galaxy A06');
    expect(cached).toBeDefined();
    expect(cached!.model).toBeDefined();
    expect(cached!.model!.id).toBe('samsung-a06');
    expect(cached!.notFound).toBe(false);
  });

  it('recognizes a researched model already present under a different slug', () => {
    const catalogModel = makeModel({ id: 'samsung-a06', fullName: 'Samsung Galaxy A06' });
    const researchedModel = makeModel({ id: 'gsm-samsung-galaxy-a06', fullName: 'Samsung Galaxy A06' });
    expect(isModelInCatalog([catalogModel], researchedModel)).toBe(true);
  });

  it('returns undefined for uncached models', () => {
    const cached = getResearchFromCache('nonexistent');
    expect(cached).toBeUndefined();
  });

  it('tracks not-found queries', () => {
    saveNotFoundToCache('Some Random Phone');
    expect(isQueryNotFoundCached('Some Random Phone')).toBe(true);
    expect(isQueryNotFoundCached('some random phone')).toBe(true);
  });

  it('does not find not-found for unregistered queries', () => {
    expect(isQueryNotFoundCached('never searched')).toBe(false);
  });

  it('model returns as in catalog via isModelInCatalog', () => {
    const models = [makeModel({ id: 'a' }), makeModel({ id: 'b' })];
    expect(isModelInCatalog(models, 'a')).toBe(true);
    expect(isModelInCatalog(models, 'c')).toBe(false);
  });

  it('reports cache size correctly', () => {
    expect(getCacheSize()).toBe(0);
    saveResearchToCache(makeModel({ id: 'm1' }));
    saveResearchToCache(makeModel({ id: 'm2' }));
    saveResearchToCache(makeModel({ id: 'm3' }));
    expect(getCacheSize()).toBe(3);
  });

  it('cleanExpiredEntries does not remove fresh entries', () => {
    saveResearchToCache(makeModel({ id: 'fresh-model' }));
    cleanExpiredEntries();
    expect(getCacheSize()).toBe(1);
  });
});
