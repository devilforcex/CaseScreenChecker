import { researchPhone } from '../../server/services/phoneResearch.js';

interface VercelRequest {
  body?: unknown;
  method?: string;
  headers?: Record<string, string | string[] | undefined>;
}

interface VercelResponse {
  setHeader: (name: string, value: string) => void;
  status: (code: number) => VercelResponse;
  json: (payload: unknown) => void;
}

const RATE_WINDOW_MS = 60_000;
const MAX_REQUESTS_PER_WINDOW = 20;
const requestBuckets = new Map<string, { startedAt: number; count: number }>();

function getClientKey(req: VercelRequest): string {
  const forwarded = req.headers?.['x-forwarded-for'];
  const first = Array.isArray(forwarded) ? forwarded[0] : forwarded;
  return first?.split(',')[0]?.trim() || 'unknown';
}

function consumeRateLimit(key: string): { allowed: boolean; retryAfterSeconds: number } {
  const now = Date.now();
  if (requestBuckets.size > 1000) {
    for (const [bucketKey, bucket] of requestBuckets) {
      if (now - bucket.startedAt >= RATE_WINDOW_MS) requestBuckets.delete(bucketKey);
    }
  }
  const bucket = requestBuckets.get(key);
  if (!bucket || now - bucket.startedAt >= RATE_WINDOW_MS) {
    requestBuckets.set(key, { startedAt: now, count: 1 });
    return { allowed: true, retryAfterSeconds: 0 };
  }
  if (bucket.count >= MAX_REQUESTS_PER_WINDOW) {
    return { allowed: false, retryAfterSeconds: Math.ceil((RATE_WINDOW_MS - (now - bucket.startedAt)) / 1000) };
  }
  bucket.count += 1;
  return { allowed: true, retryAfterSeconds: 0 };
}

/** Vercel Node function for the production external phone research flow. */
export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    res.status(405).json({ found: false, source: 'none', error: 'Method not allowed.' });
    return;
  }

  const rateLimit = consumeRateLimit(getClientKey(req));
  if (!rateLimit.allowed) {
    res.setHeader('Retry-After', String(rateLimit.retryAfterSeconds));
    res.status(429).json({ found: false, source: 'none', error: 'Research rate limit exceeded. Try again shortly.' });
    return;
  }

  const body = req.body && typeof req.body === 'object' ? req.body as Record<string, unknown> : {};
  const query = typeof body.query === 'string' ? body.query.trim() : '';
  if (!query) {
    res.status(400).json({ found: false, source: 'none', error: 'Query parameter "query" is required.' });
    return;
  }
  if (query.length > 120) {
    res.status(400).json({ found: false, source: 'none', error: 'Query is too long. Use a brand and model name (max 120 characters).' });
    return;
  }

  const result = await researchPhone(query);
  res.status(result.found ? 200 : 404).json(result);
}
