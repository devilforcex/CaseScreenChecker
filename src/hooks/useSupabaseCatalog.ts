import { useCallback, useEffect, useState } from 'react';
import { fetchPublicCatalog, type PublicCatalog } from '../data/supabaseCatalogRepository';
import { getSupabaseBrowserClient, SUPABASE_CONFIGURATION_ERROR } from '../lib/supabase';

export interface SupabaseCatalogState extends PublicCatalog {
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

const EMPTY_CATALOG: PublicCatalog = { models: [], compatibilityPairs: [] };

export function useSupabaseCatalog(): SupabaseCatalogState {
  const [catalog, setCatalog] = useState<PublicCatalog>(EMPTY_CATALOG);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const refresh = useCallback(async () => {
    const client = getSupabaseBrowserClient();
    if (!client) { setError(SUPABASE_CONFIGURATION_ERROR); setLoading(false); return; }
    setLoading(true); setError(null);
    try { setCatalog(await fetchPublicCatalog(client)); }
    catch (cause) { setError(cause instanceof Error ? cause.message : 'Could not load the verified catalog.'); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => {
    // Schedule after subscription/effect setup; avoids a synchronous state write during mount.
    const task = window.setTimeout(() => { void refresh(); }, 0);
    return () => window.clearTimeout(task);
  }, [refresh]);
  return { ...catalog, loading, error, refresh };
}
