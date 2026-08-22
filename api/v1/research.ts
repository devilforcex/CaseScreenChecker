import { researchPhone } from '../../server/services/phoneResearch.js';

interface VercelRequest {
  body?: unknown;
  method?: string;
}

interface VercelResponse {
  setHeader: (name: string, value: string) => void;
  status: (code: number) => VercelResponse;
  json: (payload: unknown) => void;
}

/** Vercel Node function for the production external phone research flow. */
export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    res.status(405).json({ found: false, source: 'none', error: 'Method not allowed.' });
    return;
  }

  const body = req.body && typeof req.body === 'object' ? req.body as Record<string, unknown> : {};
  const query = typeof body.query === 'string' ? body.query.trim() : '';
  if (!query) {
    res.status(400).json({ found: false, source: 'none', error: 'Query parameter "query" is required.' });
    return;
  }

  const result = await researchPhone(query);
  res.status(result.found ? 200 : 404).json(result);
}
