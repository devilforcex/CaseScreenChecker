/**
 * researchCache.ts — Client-side cache for researched phone specs.
 *
 * Caches PhoneModel results fetched from the server to avoid repeated
 * network requests. Entries expire after CACHE_TTL_HOURS (default 24h).
 *
 * Phase 4: also tracks which queries returned "not found" so we don't
 * re-query the server for missing models immediately.
 */

import { PhoneModel } from '../types';

interface CacheEntry {
  /** ISO timestamp when the entry was saved */
  cachedAt: string;
  /** The researched model (undefined if not found) */
  model?: PhoneModel;
  /** Whether the original query returned no results */
  notFound: boolean;
}

const STORAGE_KEY = 'case_screen_checker_research_cache_v1';
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours
const NOT_FOUND_TTL_MS = 60 * 60 * 1000;   // 1 hour — retry missing models sooner

/**
 * Check if the model with this id already exists in the main models catalog.
 */
export function isModelInCatalog(models: PhoneModel[], modelId: string): boolean {
  return models.some(m => m.id === modelId);
}

/**
 * Check if the model with this id already exists in the research cache.
 */
export function isModelInResearchCache(modelId: string): boolean {
  const cache = loadCache();
  return modelId in cache;
}

/**
 * Retrieve a cached researched model by its id.
 * Returns undefined if the entry is expired or doesn't exist.
 */
export function getResearchFromCache(modelId: string): { model?: PhoneModel; notFound: boolean } | undefined {
  const cache = loadCache();
  const entry = cache[modelId];
  if (!entry) return undefined;

  const age = Date.now() - new Date(entry.cachedAt).getTime();
  const ttl = entry.notFound ? NOT_FOUND_TTL_MS : CACHE_TTL_MS;

  if (age > ttl) {
    // Expired — remove and return undefined
    delete cache[modelId];
    saveCache(cache);
    return undefined;
  }

  return { model: entry.model, notFound: entry.notFound };
}

/**
 * Save a successfully researched model to the cache.
 */
export function saveResearchToCache(model: PhoneModel): void {
  const cache = loadCache();
  cache[model.id] = {
    cachedAt: new Date().toISOString(),
    model,
    notFound: false,
  };
  saveCache(cache);
}

/**
 * Mark a query as "not found" so we don't immediately re-query.
 */
export function saveNotFoundToCache(query: string): void {
  const cache = loadCache();
  const key = `nf:${query.toLowerCase().trim()}`;
  cache[key] = {
    cachedAt: new Date().toISOString(),
    notFound: true,
  };
  saveCache(cache);
}

/**
 * Check if a query was recently marked as "not found".
 */
export function isQueryNotFoundCached(query: string): boolean {
  const cache = loadCache();
  const key = `nf:${query.toLowerCase().trim()}`;
  const entry = cache[key];
  if (!entry) return false;

  const age = Date.now() - new Date(entry.cachedAt).getTime();
  if (age > NOT_FOUND_TTL_MS) {
    delete cache[key];
    saveCache(cache);
    return false;
  }
  return true;
}

/**
 * Clear all expired entries from the cache and return the cleaned cache.
 */
export function cleanExpiredEntries(): void {
  const cache = loadCache();
  const now = Date.now();
  for (const [key, entry] of Object.entries(cache)) {
    const age = now - new Date(entry.cachedAt).getTime();
    const ttl = entry.notFound ? NOT_FOUND_TTL_MS : CACHE_TTL_MS;
    if (age > ttl) {
      delete cache[key];
    }
  }
  saveCache(cache);
}

/**
 * Get the total number of cached entries.
 */
export function getCacheSize(): number {
  return Object.keys(loadCache()).length;
}

// ─── Internal helpers ────────────────────────────────────────────────────────

function loadCache(): Record<string, CacheEntry> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return {};
}

function saveCache(cache: Record<string, CacheEntry>): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cache));
  } catch {
    // localStorage full or blocked — silently fail
  }
}