interface Props { loading: boolean; error: string | null; onRetry: () => Promise<void>; }

/** Use above the checker body until the catalog is available. */
export function CatalogLoadState({ loading, error, onRetry }: Props) {
  if (loading) return <div role="status" className="tech-panel tech-status-rail rounded-xl p-5 text-sm text-neutral-300">Loading verified compatibility catalog…</div>;
  if (!error) return null;
  return <div role="alert" className="rounded-xl border border-red-800 bg-red-950/45 p-5 text-sm text-red-100 shadow-lg shadow-red-950/20">{error}<button onClick={() => void onRetry()} className="ml-3 font-semibold text-white underline decoration-red-400 underline-offset-4 hover:text-red-200">Retry</button></div>;
}
