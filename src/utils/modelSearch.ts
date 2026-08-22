/**
 * modelSearch.ts — Normalized phone model search with alias expansion,
 * token matching, and fuzzy ranking for retail counter use.
 *
 * Phase 1: replaces simple includes() with proper search.
 */

import { PhoneModel } from '../types';

// ─── Normalisation ───────────────────────────────────────────────────────────

/**
 * Strip common brand prefixes that users often omit or type redundantly.
 * Returns a lower-cased, collapsed form.
 */
const COMMON_BRAND_MARKERS = [
  /^samsung\s+/i,
  /^apple\s+/i,
  /^xiaomi\s+/i,
  /^motorola\s+/i,
  /^google\s+/i,
  /^honor\s+/i,
  /^realme\s+/i,
  /^oppo\s+/i,
  /^oneplus\s+/i,
  /^nokia\s+/i,
  /^huawei\s+/i,
];

/**
 * Normalize a search string or model name for matching.
 * - lowercases
 * - strips common brand prefixes
 * - collapses whitespace
 * - removes separators like - _ .
 * - normalises common terms
 */
export function normalizeQuery(q: string): string {
  let s = q.trim().toLowerCase();
  // Strip leading brand markers
  for (const pat of COMMON_BRAND_MARKERS) {
    s = s.replace(pat, '');
  }
  // Normalise spaces and separators
  s = s.replace(/[\s\-_./,]+/g, ' ');
  // Collapse repeated letters (common typos like "a05s" vs "a05s")
  s = s.replace(/(.)\1{2,}/g, '$1$1');
  return s.trim();
}

/**
 * Compute Levenshtein distance between two strings (for short model codes).
 */
function levenshtein(a: string, b: string): number {
  const m = a.length, n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;
  const dp: number[] = [];
  for (let i = 0; i <= n; i++) dp[i] = i;
  for (let i = 1; i <= m; i++) {
    let prev = dp[0];
    dp[0] = i;
    for (let j = 1; j <= n; j++) {
      const tmp = dp[j];
      dp[j] = Math.min(
        dp[j] + 1,
        dp[j - 1] + 1,
        prev + (a[i - 1] === b[j - 1] ? 0 : 1)
      );
      prev = tmp;
    }
  }
  return dp[n];
}

/**
 * Token-match score: 0-100 where higher is better.
 * Used as a simpler alternative to full fuzzy when query is a token subset.
 */
function tokenScore(queryTokens: string[], targetTokens: string[]): number {
  if (!queryTokens.length || !targetTokens.length) return 0;
  let matched = 0;
  for (const qt of queryTokens) {
    for (const tt of targetTokens) {
      if (tt === qt) { matched += 2; break; }
      if (tt.startsWith(qt) || qt.startsWith(tt)) { matched += 1.5; break; }
      if (tt.includes(qt) || qt.includes(tt)) { matched += 1; break; }
    }
  }
  return Math.round((matched / (queryTokens.length * 2)) * 100);
}

// ─── Ranking ─────────────────────────────────────────────────────────────────

export interface RankedResult {
  model: PhoneModel;
  score: number;       // 0-100, higher = better match
  matchType: 'exact_alias' | 'starts_with' | 'token' | 'fuzzy';
}

export interface ModelSearchIndex {
  models: PhoneModel[];
  tokenToModels: Map<string, Set<number>>;
  /** Prefix buckets keep keystroke searches from scanning every token. */
  prefixToModels: Map<string, Set<number>>;
}

const MAX_INDEXED_PREFIX_LENGTH = 12;

/** Build once per catalog snapshot; query keystrokes only inspect candidate models. */
export function createModelSearchIndex(models: PhoneModel[]): ModelSearchIndex {
  const tokenToModels = new Map<string, Set<number>>();
  const prefixToModels = new Map<string, Set<number>>();
  models.forEach((model, index) => {
    const fields = [model.name, model.fullName, model.brand, ...model.aliases];
    const tokens = fields.flatMap((field) => normalizeQuery(field).split(/\s+/)).filter(Boolean);
    for (const token of new Set(tokens)) {
      const indexes = tokenToModels.get(token) ?? new Set<number>();
      indexes.add(index);
      tokenToModels.set(token, indexes);

      // Store bounded prefixes once, so each query only performs O(query tokens)
      // map lookups instead of scanning the complete token index.
      for (let length = 1; length <= Math.min(token.length, MAX_INDEXED_PREFIX_LENGTH); length += 1) {
        const prefix = token.slice(0, length);
        const prefixIndexes = prefixToModels.get(prefix) ?? new Set<number>();
        prefixIndexes.add(index);
        prefixToModels.set(prefix, prefixIndexes);
      }
    }
  });
  return { models, tokenToModels, prefixToModels };
}

export function searchModelIndex(index: ModelSearchIndex, query: string, minScore = 20): RankedResult[] {
  const normalized = normalizeQuery(query);
  if (!normalized) return fuzzySearchModels(index.models, query, minScore);
  const candidates = new Set<number>();
  for (const queryToken of normalized.split(/\s+/)) {
    const prefix = queryToken.slice(0, MAX_INDEXED_PREFIX_LENGTH);
    const prefixMatches = index.prefixToModels.get(prefix);
    prefixMatches?.forEach((modelIndex) => candidates.add(modelIndex));

    // Preserve the previous short-token behaviour for queries that contain a
    // complete token or where the query itself starts with a shorter token.
    index.tokenToModels.get(queryToken)?.forEach((modelIndex) => candidates.add(modelIndex));
  }
  // Keep fuzzy typo matching as a fallback when no indexed token is close.
  const models = candidates.size ? [...candidates].map((modelIndex) => index.models[modelIndex]) : index.models;
  return fuzzySearchModels(models, query, minScore);
}

/**
 * Search and rank phone models by relevance to the query string.
 * Uses a multi-tier approach:
 *   1. Exact alias match (model code) → score 100
 *   2. Name starts with query → score 95
 *   3. Token match → score 70-90
 *   4. Levenshtein fuzzy on short codes → score 40-60
 *   5. Partial string match → score 20-40
 */
export function fuzzySearchModels(
  models: PhoneModel[],
  query: string,
  minScore: number = 20
): RankedResult[] {
  if (!query.trim()) {
    return models.map(m => ({ model: m, score: 50, matchType: 'token' as const }));
  }

  const normQuery = normalizeQuery(query);
  if (!normQuery) {
    return models.map(m => ({ model: m, score: 50, matchType: 'token' as const }));
  }

  const queryTokens = normQuery.split(/\s+/).filter(Boolean);

  const results: RankedResult[] = [];

  for (const model of models) {
    // Build candidate strings
    const normName = normalizeQuery(model.name);
    const normFull = normalizeQuery(model.fullName);
    const normBrand = normalizeQuery(model.brand);
    const normAliases = model.aliases.map(a => normalizeQuery(a)).filter(Boolean);

    const allCandidates = [normName, normFull, normBrand, ...normAliases];

    let bestScore = 0;
    let bestType: RankedResult['matchType'] = 'fuzzy';

    for (const candidate of allCandidates) {
      if (!candidate) continue;

      // 1. Exact alias match (full string equality after normalisation)
      if (candidate === normQuery) {
        if (100 > bestScore) { bestScore = 100; bestType = 'exact_alias'; }
      }

      // 2. Name starts with query
      if (candidate.startsWith(normQuery)) {
        const score = 95;
        if (score > bestScore) { bestScore = score; bestType = 'starts_with'; }
      }

      // 3. Token matching
      const candTokens = candidate.split(/\s+/).filter(Boolean);
      const tScore = tokenScore(queryTokens, candTokens);
      if (tScore > 50) {
        const adjusted = Math.min(90, 50 + tScore / 2);
        if (adjusted > bestScore) { bestScore = adjusted; bestType = 'token'; }
      }

      // 4. Levenshtein for short codes (≤ 12 chars)
      if (candidate.length <= 12 && normQuery.length <= 12) {
        const dist = levenshtein(candidate, normQuery);
        if (dist === 0) {
          bestScore = 100; bestType = 'exact_alias';
        } else if (dist <= 1) {
          if (95 > bestScore) { bestScore = 95; bestType = 'exact_alias'; }
        } else if (dist <= 2) {
          if (80 > bestScore) { bestScore = 80; bestType = 'fuzzy'; }
        } else if (dist <= 3) {
          if (50 > bestScore) { bestScore = 50; bestType = 'fuzzy'; }
        }
      }

      // 5. Partial includes (belts and braces)
      if (candidate.includes(normQuery) || normQuery.includes(candidate)) {
        const score = Math.min(60, 30 + (normQuery.length / candidate.length) * 30);
        if (score > bestScore) { bestScore = score; bestType = 'token'; }
      }
    }

    if (bestScore >= minScore) {
      results.push({ model, score: Math.round(bestScore), matchType: bestType });
    }
  }

  // Sort by score descending, then alphabetically
  results.sort((a, b) => b.score - a.score || a.model.fullName.localeCompare(b.model.fullName));

  return results;
}

/**
 * Simple deduplication helper: given a search result list, keep only
 * results where the model id hasn't been seen yet.
 */
export function dedupeResults(results: RankedResult[]): RankedResult[] {
  const seen = new Set<string>();
  return results.filter(r => {
    if (seen.has(r.model.id)) return false;
    seen.add(r.model.id);
    return true;
  });
}
