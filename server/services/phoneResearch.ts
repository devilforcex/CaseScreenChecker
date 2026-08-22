import axios from 'axios';
import type { PhoneModel } from '../../src/types.js';
import { phoneModelSchema } from '../../src/validation/schemas.js';
import { parseSearchResults, parseSpecsPage, type ParsedSearchResult } from '../utils/gsmarenaParser.js';

const GSMARENA_BASE = 'https://www.gsmarena.com';
const PHONE_SPECS_API_BASE = process.env.PHONE_SPECS_API_BASE || 'https://phone-specs-api-production.up.railway.app/api/v1';
const RESEARCH_TIMEOUT_MS = 15_000;
const FALLBACK_TIMEOUT_MS = 10_000;
const SUCCESS_CACHE_TTL_MS = 60 * 60 * 1000;
const MISS_CACHE_TTL_MS = 5 * 60 * 1000;
const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';

type ResearchSource = 'gsmarena' | 'phone_specs_api';

export interface ResearchSuccessResponse {
  found: true;
  model: PhoneModel;
  source: ResearchSource;
  sourceUrl: string;
  rawSpecs: Record<string, string>;
}

export interface ResearchNotFoundResponse {
  found: false;
  source: 'none';
  error: string;
}

export type ResearchResponse = ResearchSuccessResponse | ResearchNotFoundResponse;

const researchCache = new Map<string, { expiresAt: number; result: ResearchResponse }>();

export interface PhoneSpecsApiRecord {
  id?: string;
  brand?: string;
  model?: string;
  model_name?: string;
  screen_size?: string;
  screen_type?: string;
  resolution?: string;
  rear_camera_count?: string | number;
  rear_camera_specs?: string;
  dimensions?: string;
  weight?: string;
  fingerprint?: string;
  headphone_jack?: boolean;
  launch_date?: string;
  source?: string;
  source_url?: string;
  gsmarena_url?: string;
  gsmarena_slug?: string;
  image_url?: string;
  [key: string]: unknown;
}

interface PhoneSpecsApiResponse {
  results?: PhoneSpecsApiRecord[];
}

/**
 * Fetch and validate a phone model from an external provider.
 *
 * The structured provider is preferred because it is faster and does not
 * require scraping. GSMArena remains a last-resort source for models that are
 * not covered by the structured dataset. Results are cached per function
 * instance to avoid repeated upstream requests while an admin is reviewing a
 * candidate.
 */
export async function researchPhone(query: string): Promise<ResearchResponse> {
  const searchQuery = query.trim();
  if (!searchQuery) {
    return { found: false, source: 'none', error: 'A phone model query is required.' };
  }
  if (searchQuery.length > 120) {
    return { found: false, source: 'none', error: 'Search query is too long. Use a brand and model name (max 120 characters).' };
  }

  const cacheKey = compact(searchQuery);
  const cached = researchCache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) return cached.result;
  researchCache.delete(cacheKey);

  const structuredResult = await researchFromPhoneSpecsApi(searchQuery);
  if (structuredResult.found) {
    researchCache.set(cacheKey, { expiresAt: Date.now() + SUCCESS_CACHE_TTL_MS, result: structuredResult });
    return structuredResult;
  }

  const gsmarenaResult = await researchFromGsmarena(searchQuery);
  if (gsmarenaResult.found) {
    researchCache.set(cacheKey, { expiresAt: Date.now() + SUCCESS_CACHE_TTL_MS, result: gsmarenaResult });
    return gsmarenaResult;
  }

  const result: ResearchNotFoundResponse = {
    found: false,
    source: 'none',
    error: `${structuredResult.error} ${gsmarenaResult.error}`,
  };
  researchCache.set(cacheKey, { expiresAt: Date.now() + MISS_CACHE_TTL_MS, result });
  return result;
}

async function researchFromGsmarena(query: string): Promise<ResearchResponse> {
  try {
    const searchUrl = `${GSMARENA_BASE}/results.php3?sQuickSearch=yes&sName=${encodeURIComponent(query)}`;
    const searchRes = await axios.get(searchUrl, {
      headers: { 'User-Agent': USER_AGENT },
      timeout: RESEARCH_TIMEOUT_MS,
    });
    const searchResults = parseSearchResults(searchRes.data);

    if (searchResults.length === 0) {
      return { found: false, source: 'none', error: `No results found on GSMArena for "${query}".` };
    }

    const firstResult = chooseBestGsmarenaSearchResult(searchResults, query);
    if (!firstResult) {
      return { found: false, source: 'none', error: `No closely matching GSMArena result found for "${query}".` };
    }
    const sourceUrl = `${GSMARENA_BASE}/${firstResult.path}.php`;
    const specsRes = await axios.get(sourceUrl, {
      headers: { 'User-Agent': USER_AGENT },
      timeout: RESEARCH_TIMEOUT_MS,
    });
    const parsed = parseSpecsPage(specsRes.data, sourceUrl);

    if (!parsed.success || !parsed.model) {
      return {
        found: false,
        source: 'none',
        error: parsed.error || `Failed to parse specifications for "${firstResult.title}".`,
      };
    }

    const validation = phoneModelSchema.safeParse(parsed.model);
    if (!validation.success) {
      return { found: false, source: 'none', error: formatValidationError(firstResult.title, validation.error.issues) };
    }

    return {
      found: true,
      model: validation.data as PhoneModel,
      source: 'gsmarena',
      sourceUrl,
      rawSpecs: parsed.rawSpecs || {},
    };
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status;
      const errorMessage = error.code === 'ECONNABORTED'
        ? `GSMArena request timed out after ${RESEARCH_TIMEOUT_MS}ms.`
        : `GSMArena request failed${status ? ` (${status})` : ''}.`;
      return { found: false, source: 'none', error: errorMessage };
    }
    console.error('[Research] GSMArena provider error:', error);
    return { found: false, source: 'none', error: 'GSMArena returned an unreadable response.' };
  }
}

async function researchFromPhoneSpecsApi(query: string): Promise<ResearchResponse> {
  try {
    const response = await axios.get<PhoneSpecsApiResponse>(`${PHONE_SPECS_API_BASE}/search`, {
      params: { q: query, limit: 10 },
      timeout: FALLBACK_TIMEOUT_MS,
      headers: { Accept: 'application/json' },
    });
    const records = Array.isArray(response.data?.results) ? response.data.results : [];
    const record = chooseBestFallbackRecord(records, query);
    if (!record) return { found: false, source: 'none', error: 'No fallback records found.' };

    const model = mapFallbackRecord(record);
    const validation = phoneModelSchema.safeParse(model);
    if (!validation.success) return { found: false, source: 'none', error: formatValidationError(model.fullName, validation.error.issues) };

    return {
      found: true,
      model: validation.data as PhoneModel,
      source: 'phone_specs_api',
      sourceUrl: record.source_url || record.gsmarena_url || `${PHONE_SPECS_API_BASE}/search?q=${encodeURIComponent(query)}`,
      rawSpecs: Object.fromEntries(Object.entries(record).filter((entry): entry is [string, string] => typeof entry[1] === 'string')),
    };
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      const detail = error.code === 'ECONNABORTED' ? 'Fallback provider timed out.' : 'Fallback provider unavailable.';
      return { found: false, source: 'none', error: detail };
    }
    console.error('[Research] Fallback provider error:', error);
    return { found: false, source: 'none', error: 'Fallback provider returned an unreadable response.' };
  }
}

export function chooseBestFallbackRecord(records: PhoneSpecsApiRecord[], query: string): PhoneSpecsApiRecord | undefined {
  const normalizedQuery = compact(query);
  const queryTokens = tokenize(query);
  const ranked = records
    .filter((record) => record.brand && (record.model_name || record.model) && record.dimensions && record.screen_size)
    .map((record) => {
      const fullName = `${record.brand} ${record.model_name || record.model}`;
      const normalizedName = compact(fullName);
      const nameTokens = new Set(tokenize(fullName));
      const modelOnly = compact(String(record.model || ''));
      const modelName = compact(String(record.model_name || ''));
      const overlap = queryTokens.filter((token) => nameTokens.has(token)).length;
      const coverage = queryTokens.length ? overlap / queryTokens.length : 0;
      const score = normalizedName === normalizedQuery
        ? 100
        : modelName === normalizedQuery || modelOnly === normalizedQuery
          ? 96
          : coverage >= 1 ? (nameTokens.size === queryTokens.length ? 90 : 82)
            : coverage >= 0.75 ? 76
              : 0;
      return { record, score };
    })
    .sort((left, right) => right.score - left.score);
  const best = ranked[0];
  return best && best.score >= 76 ? best.record : undefined;
}

/** Select the closest GSMArena search result instead of trusting result order. */
export function chooseBestGsmarenaSearchResult(results: ParsedSearchResult[], query: string): ParsedSearchResult | undefined {
  const normalizedQuery = compact(query);
  const queryTokens = tokenize(query);
  const ranked = results.map((result) => {
    const normalizedTitle = compact(result.title);
    const titleTokens = new Set(tokenize(result.title));
    const overlap = queryTokens.filter((token) => titleTokens.has(token)).length;
    const coverage = queryTokens.length ? overlap / queryTokens.length : 0;
    const score = normalizedTitle === normalizedQuery
      ? 100
      : coverage >= 1 ? (titleTokens.size === queryTokens.length ? 90 : 82)
        : coverage >= 0.75 ? 76
          : 0;
    return { result, score };
  }).sort((left, right) => right.score - left.score);
  const best = ranked[0];
  return best && best.score >= 76 ? best.result : undefined;
}

function tokenize(value: string): string[] {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, ' ').split(/\s+/).filter((token) => token.length > 1);
}

function mapFallbackRecord(record: PhoneSpecsApiRecord): PhoneModel {
  const brand = String(record.brand);
  const name = String(record.model_name || record.model);
  const fullName = `${brand} ${name}`.trim();
  const dimensions = parseDimensions(record.dimensions);
  const screenDiagonal = parseFirstNumber(record.screen_size);
  const idBase = compact(`${brand}-${name}`).replace(/ /g, '-');

  return {
    id: `api-${idBase}`,
    brand,
    name,
    fullName,
    releaseYear: parseYear(record.launch_date),
    dimensions,
    screen: {
      diagonalIn: screenDiagonal,
      curvature: /curved|edge/i.test(String(record.screen_type || '')) ? '2.5d_curved_edge' : 'flat',
      notchType: /dynamic island/i.test(fullName) ? 'dynamic_island' : 'punch_hole_center',
      aspectRatio: deriveAspectRatio(record.resolution),
      hasCurvedEdges: /curved|edge/i.test(String(record.screen_type || '')),
    },
    camera: {
      shape: 'individual_rings',
      lensCount: parseFirstNumber(record.rear_camera_count) || 1,
      bumpHeightMm: 1.5,
      position: 'top_left',
    },
    features: {
      hasHeadphoneJack: Boolean(record.headphone_jack),
      fingerprint: mapFingerprint(record.fingerprint),
      portType: 'usb_c',
      buttonLayout: 'power_right_vol_right',
    },
    aliases: [record.id, record.gsmarena_slug].filter((value): value is string => Boolean(value)),
    notes: `Source: phone-specs-api (${record.source || 'external provider'})${record.gsmarena_url ? ` | GSMArena: ${record.gsmarena_url}` : ''}`,
    imageUrl: record.image_url,
  };
}

function parseDimensions(value: unknown): { height: number; width: number; thickness: number; weightG?: number } {
  const numbers = String(value || '').match(/[0-9]+(?:\.[0-9]+)?/g)?.map(Number) || [];
  return { height: numbers[0] || 1, width: numbers[1] || 1, thickness: numbers[2] || 1 };
}

function parseFirstNumber(value: unknown): number {
  return Number(String(value || '').match(/[0-9]+(?:\.[0-9]+)?/)?.[0] || 0);
}

function parseYear(value: unknown): number {
  return Number(String(value || '').match(/20[0-9]{2}/)?.[0] || new Date().getFullYear());
}

function deriveAspectRatio(resolution: unknown): string {
  const match = String(resolution || '').match(/(\d+)\s*x\s*(\d+)/i);
  if (!match) return '20:9';
  const ratio = Number(match[1]) / Number(match[2]);
  return ratio > 0.5 ? '20:9' : ratio > 0.47 ? '19.5:9' : '19:9';
}

function mapFingerprint(value: unknown): 'under_display' | 'side_power_button' | 'rear' | 'none' {
  const text = String(value || '').toLowerCase();
  if (!text || text.includes('none') || text.includes('无')) return 'none';
  if (text.includes('under') || text.includes('screen') || text.includes('屏下')) return 'under_display';
  if (text.includes('side') || text.includes('power') || text.includes('侧')) return 'side_power_button';
  return 'rear';
}

function compact(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '');
}

function formatValidationError(name: string, issues: Array<{ path: PropertyKey[]; message: string }>): string {
  const details = issues.map((issue) => `${issue.path.join('.') || 'model'}: ${issue.message}`).join('; ');
  return `Incomplete specifications for "${name}". ${details}`;
}
