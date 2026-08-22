import axios from 'axios';
import type { PhoneModel } from '../../src/types.js';
import { phoneModelSchema } from '../../src/validation/schemas.js';
import { parseSearchResults, parseSpecsPage } from '../utils/gsmarenaParser.js';

const GSMARENA_BASE = 'https://www.gsmarena.com';
const RESEARCH_TIMEOUT_MS = 15_000;
const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';

export interface ResearchSuccessResponse {
  found: true;
  model: PhoneModel;
  source: 'gsmarena';
  sourceUrl: string;
  rawSpecs: Record<string, string>;
}

export interface ResearchNotFoundResponse {
  found: false;
  source: 'none';
  error: string;
}

export type ResearchResponse = ResearchSuccessResponse | ResearchNotFoundResponse;

/**
 * Fetch and validate a phone model from GSMArena.
 *
 * This is deliberately kept server-side: GSMArena does not expose a browser
 * CORS API and the user must never need to provide credentials to research a
 * public specification page.
 */
export async function researchPhone(query: string): Promise<ResearchResponse> {
  const searchQuery = query.trim();
  if (!searchQuery) {
    return { found: false, source: 'none', error: 'A phone model query is required.' };
  }

  try {
    const searchUrl = `${GSMARENA_BASE}/results.php3?sQuickSearch=yes&sName=${encodeURIComponent(searchQuery)}`;
    const searchRes = await axios.get(searchUrl, {
      headers: { 'User-Agent': USER_AGENT },
      timeout: RESEARCH_TIMEOUT_MS,
    });
    const searchResults = parseSearchResults(searchRes.data);

    if (searchResults.length === 0) {
      return { found: false, source: 'none', error: `No results found on GSMArena for "${searchQuery}".` };
    }

    const firstResult = searchResults[0];
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
      const issues = validation.error.issues
        .map((issue) => `${issue.path.join('.') || 'model'}: ${issue.message}`)
        .join('; ');
      return {
        found: false,
        source: 'none',
        error: `GSMArena returned incomplete specifications for "${firstResult.title}". ${issues}`,
      };
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
    console.error('[Research] Unexpected error:', error);
    return { found: false, source: 'none', error: 'Internal server error processing research request.' };
  }
}
