import { useCallback, useEffect, useState } from 'react';
import { fetchPublicCatalog, type PublicCatalog } from '../data/supabaseCatalogRepository';
import { getSupabaseBrowserClient, SUPABASE_CONFIGURATION_ERROR } from '../lib/supabase';

export interface SupabaseCatalogState extends PublicCatalog {
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

const EMPTY_CATALOG: PublicCatalog = { models: [], compatibilityPairs: [] };
const CATALOG_TIMEOUT_MS = 12_000;
const MAX_CATALOG_ATTEMPTS = 2;

function catalogErrorMessage(cause: unknown): string {
  if (cause instanceof Error && cause.name === 'AbortError') {
    return 'The verified catalog request timed out. Check your network and retry.';
  }
  const message = cause instanceof Error ? cause.message : String(cause);
  if (/permission|forbidden|rls|not authorized|401|403/i.test(message)) {
    return 'The verified catalog is protected by Supabase RLS. Refresh the page or contact an administrator.';
  }
  if (/network|fetch|timeout|failed to fetch/i.test(message)) {
    return 'Supabase is temporarily unavailable. Check your network and retry.';
  }
  return message || 'Could not load the verified catalog.';
}

async function fetchCatalogWithTimeout(client: Parameters<typeof fetchPublicCatalog>[0]): Promise<PublicCatalog> {
  let lastError: unknown;
  for (let attempt = 0; attempt < MAX_CATALOG_ATTEMPTS; attempt += 1) {
    try {
      let timeoutId: number | undefined;
      const timeout = new Promise<PublicCatalog>((_, reject) => {
        timeoutId = window.setTimeout(() => reject(new DOMException('Catalog request timed out', 'AbortError')), CATALOG_TIMEOUT_MS);
      });
      try {
        return await Promise.race([fetchPublicCatalog(client), timeout]);
      } finally {
        if (timeoutId !== undefined) window.clearTimeout(timeoutId);
      }
    } catch (cause) {
      lastError = cause;
      if (attempt < MAX_CATALOG_ATTEMPTS - 1) {
        await new Promise((resolve) => window.setTimeout(resolve, 350 * (attempt + 1)));
      }
    }
  }
  throw lastError;
}

export function useSupabaseCatalog(): SupabaseCatalogState {
  const [catalog, setCatalog] = useState<PublicCatalog>(EMPTY_CATALOG);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const refresh = useCallback(async () => {
    const client = getSupabaseBrowserClient();
    if (!client) { setError(SUPABASE_CONFIGURATION_ERROR); setLoading(false); return; }
    setLoading(true); setError(null);
    try { setCatalog(await fetchCatalogWithTimeout(client)); }
    catch (cause) { setError(catalogErrorMessage(cause)); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => {
    // Schedule after subscription/effect setup; avoids a synchronous state write during mount.
    const task = window.setTimeout(() => { void refresh(); }, 0);
    return () => window.clearTimeout(task);
  }, [refresh]);
  return { ...catalog, loading, error, refresh };
}
