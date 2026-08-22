import React, { useState } from 'react';
import {
  Globe,
  Search,
  Sparkles,
  ExternalLink,
  PlusCircle,
  CheckCircle,
  AlertTriangle,
  Smartphone,
  Maximize,
  Camera,
  Cpu,
  Edit3,
  X
} from 'lucide-react';
import type { PhoneModel } from '../types';
import {
  getResearchFromCache,
  saveResearchToCache,
  saveNotFoundToCache,
  isModelInCatalog,
} from '../utils/researchCache';

interface ExternalResearchPanelProps {
  initialQuery?: string;
  onAddModel: (model: PhoneModel) => Promise<void>;
  existingModels: PhoneModel[];
  canAddModel: boolean;
  onRequestSignIn: () => void;
}

interface ResearchState {
  loading: boolean;
  found: boolean;
  model?: PhoneModel;
  source?: string;
  rawSpecs?: Record<string, string>;
  sourceUrl?: string;
  error?: string;
}

export const ExternalResearchPanel: React.FC<ExternalResearchPanelProps> = ({
  initialQuery = '',
  onAddModel,
  existingModels,
  canAddModel,
  onRequestSignIn,
}) => {
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [researchState, setResearchState] = useState<ResearchState>({ loading: false, found: false });
  const [addedModelIds, setAddedModelIds] = useState<Set<string>>(new Set());
  const [editingSpecs, setEditingSpecs] = useState(false);
  const [editableModel, setEditableModel] = useState<PhoneModel | null>(null);
  const [savingModel, setSavingModel] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const isAlreadyInCatalog = (model: PhoneModel) =>
    isModelInCatalog(existingModels, model) || addedModelIds.has(model.id);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchQuery.trim();
    if (!q) return;

    // Check cache first
    const cached = getResearchFromCache(q);
    if (cached) {
      if (cached.model) {
        setResearchState({
          loading: false,
          found: true,
          model: cached.model,
          source: 'cached research',
          sourceUrl: undefined,
        });
        setEditableModel({ ...cached.model });
        return;
      }
      if (cached.notFound) {
        setResearchState({
          loading: false,
          found: false,
          error: `"${q}" — no results found in recent search (cached). Try again later or enter specs manually.`,
        });
        return;
      }
    }

    setResearchState({ loading: true, found: false });

    try {
      const controller = new AbortController();
      const timeoutId = window.setTimeout(() => controller.abort(), 20_000);
      let resp: Response;
      try {
        resp = await fetch('/api/v1/research', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: q }),
          signal: controller.signal,
        });
      } finally {
        window.clearTimeout(timeoutId);
      }

      const data = await resp.json();

      if (data.found && data.model) {
        saveResearchToCache(data.model, q);
        setResearchState({
          loading: false,
          found: true,
          model: data.model,
          source: data.source,
          rawSpecs: data.rawSpecs,
          sourceUrl: data.sourceUrl,
        });
        setEditableModel({ ...data.model });
      } else {
        saveNotFoundToCache(q);
        setResearchState({
          loading: false,
          found: false,
          error: data.error || `No results found for "${q}".`,
        });
      }
    } catch (err: unknown) {
      const message = err instanceof DOMException && err.name === 'AbortError'
        ? 'Research timed out after 20 seconds. Try a shorter model name.'
        : err instanceof Error ? err.message : 'Network error';
      setResearchState({
        loading: false,
        found: false,
        error: `Research API unavailable: ${message}. You can enter specs manually using the Add Model form.`,
      });
    }
  };

  const handlePromoteToCatalog = async () => {
    if (!researchState.model) return;
    if (!canAddModel) {
      onRequestSignIn();
      return;
    }
    if (isAlreadyInCatalog(researchState.model) || savingModel) return;

    const modelToAdd = editingSpecs && editableModel ? editableModel : researchState.model;
    setSavingModel(true);
    setSaveError(null);
    try {
      await onAddModel(modelToAdd);
      setAddedModelIds(prev => new Set(prev).add(modelToAdd.id));
      setEditingSpecs(false);
    } catch (error: unknown) {
      setSaveError(error instanceof Error ? error.message : 'The model could not be added to the catalog.');
    } finally {
      setSavingModel(false);
    }
  };

  const handleSpecsChange = (field: string, value: any) => {
    if (!editableModel) return;
    const updated = { ...editableModel };

    const parts = field.split('.');
    if (parts.length === 2) {
      (updated as any)[parts[0]] = {
        ...(updated as any)[parts[0]],
        [parts[1]]: value,
      };
    } else if (parts.length === 3) {
      (updated as any)[parts[0]] = {
        ...(updated as any)[parts[0]],
        [parts[1]]: {
          ...((updated as any)[parts[0]]?.[parts[1]] || {}),
          [parts[2]]: value,
        },
      };
    } else {
      (updated as any)[field] = value;
    }

    setEditableModel(updated);
  };

  return (
    <div className="space-y-6">
      {/* Research Search Bar */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 shadow-xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
            <Globe className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-neutral-100 flex items-center gap-2">
              Online Phone Research
            </h3>
            <p className="text-xs text-neutral-400">
              Search external phone specifications for models not in your local catalog.
            </p>
          </div>
        </div>

        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-500">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search online for a phone model (e.g. Galaxy A06, iPhone 16)..."
              className="w-full pl-10 pr-4 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-sm text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-blue-500 font-mono"
            />
          </div>
          <button
            type="submit"
            disabled={researchState.loading || !searchQuery.trim()}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:bg-neutral-800 text-white text-xs font-semibold rounded-xl flex items-center gap-2 transition-colors cursor-pointer shadow-md"
          >
            {researchState.loading ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Searching online...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Search online</span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* Error Messages */}
      {researchState.error && !researchState.found && !researchState.loading && (
        <div className="bg-amber-950/60 border border-amber-800/60 rounded-2xl p-4 flex items-start gap-3 text-xs">
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="text-neutral-300 space-y-1">
            <p className="font-semibold text-amber-300">No reliable online result found</p>
            <p className="text-neutral-400 leading-relaxed text-[11px]">{researchState.error}</p>
            <p className="text-neutral-500 text-[11px] mt-1">
              Tip: Try a different search term (brand + model number) or use the Add Model form.
            </p>
          </div>
        </div>
      )}

      {/* Research Result */}
      {researchState.found && researchState.model && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400 font-mono flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-green-400" />
              External Research Result
            </h4>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-orange-950 text-orange-300 border border-orange-800 font-semibold">
                {researchState.source === 'gsmarena'
                  ? 'GSMARENA FALLBACK'
                  : researchState.source === 'phone_specs_api'
                    ? 'STRUCTURED PROVIDER'
                    : 'EXTERNAL RESEARCH'}
              </span>
              {researchState.sourceUrl && (
                <a
                  href={researchState.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] font-mono text-blue-400 hover:text-blue-300 flex items-center gap-1"
                >
                  <ExternalLink className="w-3 h-3" />
                  Source
                </a>
              )}
            </div>
          </div>

          {/* Specs Card */}
          <div className="bg-neutral-900 border border-neutral-800 hover:border-neutral-700 rounded-2xl p-5 shadow-lg">
            <div className="flex items-start justify-between gap-3 pb-4 border-b border-neutral-800">
              <div>
                <h5 className="text-lg font-bold text-neutral-100">
                  {researchState.model.fullName}
                </h5>
                <span className="text-[11px] font-mono text-neutral-400">
                  {researchState.model.brand} · {researchState.model.releaseYear}
                </span>
              </div>
              <button
                onClick={() => void handlePromoteToCatalog()}
                disabled={isAlreadyInCatalog(researchState.model) || savingModel}
                className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shrink-0 ${
                  isAlreadyInCatalog(researchState.model)
                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                    : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md'
                }`}
              >
                {isAlreadyInCatalog(researchState.model) ? (
                  <>
                    <CheckCircle className="w-3.5 h-3.5" />
                    Already in Catalog
                  </>
                ) : !canAddModel ? (
                  <>
                    <PlusCircle className="w-3.5 h-3.5" />
                    Sign in as staff to add
                  </>
                ) : savingModel ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Saving…
                  </>
                ) : (
                  <>
                    <PlusCircle className="w-3.5 h-3.5" />
                    Promote to Catalog
                  </>
                )}
              </button>
            </div>

            {saveError && (
              <div role="alert" className="mt-3 rounded-xl border border-red-900/70 bg-red-950/40 px-3 py-2 text-xs text-red-200">
                {saveError}
              </div>
            )}

            {/* Specs Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
              <div className="bg-neutral-950/80 border border-neutral-800/80 rounded-xl p-3">
                <div className="flex items-center gap-1.5 text-neutral-400 text-xs mb-1">
                  <Maximize className="w-3.5 h-3.5 text-blue-400" />
                  <span>Dimensions</span>
                </div>
                <p className="text-sm font-semibold text-neutral-200 font-mono">
                  {researchState.model.dimensions.height} x {researchState.model.dimensions.width} mm
                </p>
                <p className="text-[11px] text-neutral-500 font-mono mt-0.5">
                  Thickness: {researchState.model.dimensions.thickness} mm
                  {researchState.model.dimensions.weightG && ` (${researchState.model.dimensions.weightG}g)`}
                </p>
              </div>

              <div className="bg-neutral-950/80 border border-neutral-800/80 rounded-xl p-3">
                <div className="flex items-center gap-1.5 text-neutral-400 text-xs mb-1">
                  <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Display</span>
                </div>
                <p className="text-sm font-semibold text-neutral-200 font-mono">
                  {researchState.model.screen.diagonalIn}" · {researchState.model.screen.curvature.toUpperCase()}
                </p>
                <p className="text-[11px] text-neutral-500 font-mono mt-0.5 capitalize">
                  {researchState.model.screen.notchType.replace(/_/g, ' ')} · {researchState.model.screen.aspectRatio}
                </p>
              </div>

              <div className="bg-neutral-950/80 border border-neutral-800/80 rounded-xl p-3">
                <div className="flex items-center gap-1.5 text-neutral-400 text-xs mb-1">
                  <Camera className="w-3.5 h-3.5 text-purple-400" />
                  <span>Camera</span>
                </div>
                <p className="text-sm font-semibold text-neutral-200 font-mono capitalize">
                  {researchState.model.camera.shape.replace(/_/g, ' ')}
                </p>
                <p className="text-[11px] text-neutral-500 font-mono mt-0.5">
                  {researchState.model.camera.lensCount} lenses · {researchState.model.camera.bumpHeightMm}mm bump
                </p>
              </div>

              <div className="bg-neutral-950/80 border border-neutral-800/80 rounded-xl p-3">
                <div className="flex items-center gap-1.5 text-neutral-400 text-xs mb-1">
                  <Cpu className="w-3.5 h-3.5 text-amber-400" />
                  <span>Features</span>
                </div>
                <p className="text-xs font-semibold text-neutral-200 font-mono">
                  {researchState.model.features.portType.toUpperCase()} · {researchState.model.features.fingerprint.replace(/_/g, ' ')}
                </p>
                <p className="text-[11px] text-neutral-500 font-mono mt-0.5">
                  3.5mm: {researchState.model.features.hasHeadphoneJack ? 'Yes' : 'No'}
                </p>
              </div>
            </div>

            {/* Aliases */}
            {researchState.model.aliases && researchState.model.aliases.length > 0 && (
              <div className="mt-3 flex items-center gap-1.5 flex-wrap">
                <span className="text-[11px] text-neutral-500 font-mono mr-1">Aliases:</span>
                {researchState.model.aliases.map(alias => (
                  <span key={alias} className="text-[10px] font-mono px-1.5 py-0.5 bg-neutral-800 text-neutral-300 rounded border border-neutral-700">
                    {alias}
                  </span>
                ))}
              </div>
            )}

            {/* Raw Specs */}
            {researchState.rawSpecs && Object.keys(researchState.rawSpecs).length > 0 && (
              <details className="mt-3">
                <summary className="text-[11px] font-mono text-neutral-500 cursor-pointer hover:text-neutral-300">
                  View raw external specifications ({Object.keys(researchState.rawSpecs).length} fields)
                </summary>
                <div className="mt-2 bg-neutral-950 border border-neutral-800 rounded-xl p-3 max-h-48 overflow-y-auto">
                  {Object.entries(researchState.rawSpecs).map(([key, value]) => (
                    <div key={key} className="flex gap-2 text-[11px] font-mono py-0.5 border-b border-neutral-800/50 last:border-b-0">
                      <span className="text-neutral-500 shrink-0 w-40 truncate">{key}:</span>
                      <span className="text-neutral-300">{value}</span>
                    </div>
                  ))}
                </div>
              </details>
            )}

            {researchState.model.notes && (
              <p className="mt-3 text-[11px] text-neutral-500 font-mono">{researchState.model.notes}</p>
            )}
          </div>

          {/* Edit Specs Button */}
          {!editingSpecs && (
            <div className="flex justify-end">
              <button
                onClick={() => setEditingSpecs(true)}
                className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-semibold rounded-xl flex items-center gap-1.5 border border-neutral-700 transition-colors cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" />
                Review / Edit Specs Before Adding
              </button>
            </div>
          )}

          {/* Editable Specs Form */}
          {editingSpecs && editableModel && (
            <div className="bg-neutral-950 border border-neutral-800 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h5 className="text-xs font-bold text-neutral-300 flex items-center gap-2">
                  <Edit3 className="w-4 h-4 text-blue-400" />
                  Edit Specifications
                </h5>
                <button onClick={() => setEditingSpecs(false)} className="text-neutral-500 hover:text-neutral-300 cursor-pointer">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="text-neutral-400 font-mono block mb-1">Brand</label>
                  <input type="text" value={editableModel.brand} onChange={(e) => handleSpecsChange('brand', e.target.value)} className="w-full bg-neutral-900 border border-neutral-700 rounded-lg p-2 text-neutral-200 font-mono" />
                </div>
                <div>
                  <label className="text-neutral-400 font-mono block mb-1">Name</label>
                  <input type="text" value={editableModel.name} onChange={(e) => handleSpecsChange('name', e.target.value)} className="w-full bg-neutral-900 border border-neutral-700 rounded-lg p-2 text-neutral-200 font-mono" />
                </div>
                <div>
                  <label className="text-neutral-400 font-mono block mb-1">Year</label>
                  <input type="number" value={editableModel.releaseYear} onChange={(e) => handleSpecsChange('releaseYear', parseInt(e.target.value) || 2024)} className="w-full bg-neutral-900 border border-neutral-700 rounded-lg p-2 text-neutral-200 font-mono" />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="text-neutral-400 font-mono block mb-1">Height (mm)</label>
                  <input type="number" step="0.1" value={editableModel.dimensions.height} onChange={(e) => handleSpecsChange('dimensions.height', parseFloat(e.target.value) || 0)} className="w-full bg-neutral-900 border border-neutral-700 rounded-lg p-2 text-neutral-200 font-mono" />
                </div>
                <div>
                  <label className="text-neutral-400 font-mono block mb-1">Width (mm)</label>
                  <input type ="number" step="0.1" value={editableModel.dimensions.width} onChange={(e) => handleSpecsChange('dimensions.width', parseFloat(e.target.value) || 0)} className="w-full bg-neutral-900 border border-neutral-700 rounded-lg p-2 text-neutral-200 font-mono" />
                </div>
                <div>
                  <label className="text-neutral-400 font-mono block mb-1">Thickness (mm)</label>
                  <input type="number" step="0.1" value={editableModel.dimensions.thickness} onChange={(e) => handleSpecsChange('dimensions.thickness', parseFloat(e.target.value) || 0)} className="w-full bg-neutral-900 border border-neutral-700 rounded-lg p-2 text-neutral-200 font-mono" />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="text-neutral-400 font-mono block mb-1">Screen Diagonal (")</label>
                  <input type="number" step="0.01" value={editableModel.screen.diagonalIn} onChange={(e) => handleSpecsChange('screen.diagonalIn', parseFloat(e.target.value) || 0)} className="w-full bg-neutral-900 border border-neutral-700 rounded-lg p-2 text-neutral-200 font-mono" />
                </div>
                <div>
                  <label className="text-neutral-400 font-mono block mb-1">Notch Type</label>
                  <select value={editableModel.screen.notchType} onChange={(e) => handleSpecsChange('screen.notchType', e.target.value)} className="w-full bg-neutral-900 border border-neutral-700 rounded-lg p-2 text-neutral-200 font-mono">
                    <option value="punch_hole_center">Punch Hole Center</option>
                    <option value="waterdrop_u">Waterdrop</option>
                    <option value="dynamic_island">Dynamic Island</option>
                    <option value="wide_notch">Wide Notch</option>
                    <option value="bezel">Bezel</option>
                  </select>
                </div>
                <div>
                  <label className="text-neutral-400 font-mono block mb-1">Curvature</label>
                  <select value={editableModel.screen.curvature} onChange={(e) => handleSpecsChange('screen.curvature', e.target.value)} className="w-full bg-neutral-900 border border-neutral-700 rounded-lg p-2 text-neutral-200 font-mono">
                    <option value="flat">Flat</option>
                    <option value="2.5d_curved_edge">2.5D Curved</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => { void handlePromoteToCatalog(); }}
                  disabled={savingModel}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl flex items-center gap-2 transition-colors cursor-pointer shadow-md"
                >
                  <CheckCircle className="w-4 h-4" />
                  Confirm & Add to Catalog
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Empty state */}
      {!researchState.loading && !researchState.found && !researchState.error && (
        <div className="bg-neutral-900/60 border border-neutral-800 border-dashed rounded-2xl p-10 text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-neutral-800 flex items-center justify-center mx-auto text-neutral-400">
            <Globe className="w-6 h-6" />
          </div>
          <div>
          <h3 className="text-base font-bold text-neutral-200">Search online for a phone model</h3>
            <p className="text-xs text-neutral-400 max-w-md mx-auto mt-1">
              Enter a model name above (e.g. "Galaxy A06", "iPhone 16", "Redmi Note 13")
              to fetch its physical specifications and add it to your catalog.
            </p>
            <p className="text-xs text-neutral-500 max-w-md mx-auto mt-2 font-mono">
              Results are cached for 24h. Already-catalogued models are skipped automatically.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
