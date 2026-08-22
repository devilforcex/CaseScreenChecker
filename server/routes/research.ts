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
import { researchPhone } from '../services/phoneResearch.js';

const router = Router();

/**
 * POST /api/v1/research
 *
 * Searches the structured provider first and falls back to GSMArena when no
 * confident structured match exists. Results are provisional until staff review.
 */
router.post('/', async (req: Request, res: Response) => {
  const { query } = req.body as { query?: unknown };

  if (!query || typeof query !== 'string' || query.trim().length === 0) {
    return res.status(400).json({
      found: false,
      source: 'none',
      error: 'Query parameter "query" is required and must be a non-empty string.',
    });
  }

  const searchQuery = query.trim();

  try {
    const result = await researchPhone(searchQuery);
    return res.status(result.found ? 200 : 404).json(result);
  } catch (err: unknown) {
    console.error('[Research] Unexpected route error:', err);
    return res.status(500).json({ found: false, source: 'none', error: 'Internal server error processing research request.' });
  }
});

export default router;
