/**
 * research.ts — Server-side research API endpoint.
 *
 * POST /api/v1/research
 *   Body:    { query: string }
 *   Returns: { found: boolean, model?: PhoneModel, source: string, rawSpecs?: Record<string, string> }
 *
 * Scrapes GSMArena for phone specifications when they're not in the local catalog.
 * Uses axios for HTTP and cheerio for HTML parsing.
 */

import { Router, Request, Response } from 'express';
import axios from 'axios';
import { parseSearchResults, parseSpecsPage } from '../utils/gsmarenaParser.js';
import type { PhoneModel } from '../../src/types.js';
import { phoneModelSchema } from '../../src/validation/schemas.js';

const router = Router();

const GSMARENA_BASE = 'https://www.gsmarena.com';
const RESEARCH_TIMEOUT_MS = 15_000;
const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';

interface ResearchBody {
  query: string;
}

interface ResearchSuccessResponse {
  found: true;
  model: PhoneModel;
  source: 'gsmarena';
  sourceUrl: string;
  rawSpecs: Record<string, string>;
}

interface ResearchNotFoundResponse {
  found: false;
  source: 'none';
  error: string;
}

type ResearchResponse = ResearchSuccessResponse | ResearchNotFoundResponse;

/**
 * POST /api/v1/research
 *
 * Searches GSMArena for the given query and returns parsed phone specs.
 * First tries to find the exact model via search, then parses the specs page.
 */
router.post('/', async (req: Request, res: Response) => {
  const { query } = req.body as ResearchBody;

  if (!query || typeof query !== 'string' || query.trim().length === 0) {
    return res.status(400).json({
      found: false,
      source: 'none',
      error: 'Query parameter "query" is required and must be a non-empty string.',
    });
  }

  const searchQuery = query.trim();

  try {
    // Step 1: Search GSMArena
    const searchUrl = `${GSMARENA_BASE}/results.php3?sQuickSearch=yes&sName=${encodeURIComponent(searchQuery)}`;
    const searchRes = await axios.get(searchUrl, {
      headers: { 'User-Agent': USER_AGENT },
      timeout: RESEARCH_TIMEOUT_MS,
    });

    const searchResults = parseSearchResults(searchRes.data);

    if (searchResults.length === 0) {
      return res.json({
        found: false,
        source: 'none',
        error: `No results found on GSMArena for "${searchQuery}".`,
      } as ResearchNotFoundResponse);
    }

    // Step 2: Open the first result's specs page
    const firstResult = searchResults[0];
    const specsUrl = `${GSMARENA_BASE}/${firstResult.path}.php`;
    const specsRes = await axios.get(specsUrl, {
      headers: { 'User-Agent': USER_AGENT },
      timeout: RESEARCH_TIMEOUT_MS,
    });

    // Step 3: Parse specifications
    const parsed = parseSpecsPage(specsRes.data, specsUrl);

    if (!parsed.success || !parsed.model) {
      return res.json({
        found: false,
        source: 'none',
        error: parsed.error || `Failed to parse specifications for "${firstResult.title}".`,
      } as ResearchNotFoundResponse);
    }

    // Step 4: Validate the parsed model with Zod schema
    const validation = phoneModelSchema.safeParse(parsed.model);
    if (!validation.success) {
      // Still return what we parsed even if validation fails — let the client decide
      return res.json({
        found: true,
        model: parsed.model,
        source: 'gsmarena',
        sourceUrl: specsUrl,
        rawSpecs: parsed.rawSpecs || {},
        _validation: validation.error.issues.map(i => ({ path: i.path.join('.'), message: i.message })),
      } as ResearchSuccessResponse & { _validation: any });
    }

    return res.json({
      found: true,
      model: validation.data,
      source: 'gsmarena',
      sourceUrl: specsUrl,
      rawSpecs: parsed.rawSpecs || {},
    } as ResearchSuccessResponse);

  } catch (err: any) {
    if (axios.isAxiosError(err)) {
      const status = err.response?.status || 502;
      const msg = err.code === 'ECONNABORTED'
        ? `GSMArena request timed out after ${RESEARCH_TIMEOUT_MS}ms.`
        : `GSMArena request failed: ${err.message}`;
      return res.status(status).json({
        found: false,
        source: 'none',
        error: msg,
      } as ResearchNotFoundResponse);
    }

    console.error('[Research] Unexpected error:', err);
    return res.status(500).json({
      found: false,
      source: 'none',
      error: 'Internal server error processing research request.',
    } as ResearchNotFoundResponse);
  }
});

export default router;