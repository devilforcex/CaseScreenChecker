interface Props { loading: boolean; error: string | null; onRetry: () => Promise<void>; }

/** Use above the checker body until the catalog is available. */
export function CatalogLoadState({ loading, error, onRetry }: Props) {
  if (loading) return <div role="status" className="rounded-2xl border border-neutral-800 bg-neutral-900 p-5 text-sm text-neutral-400">Loading verified compatibility catalog…</div>;
  if (!error) return null;
  return <div role="alert" className="rounded-2xl border border-red-900 bg-red-950/40 p-5 text-sm text-red-200">{error}<button onClick={() => void onRetry()} className="ml-3 underline hover:text-white">Retry</button></div>;
}
