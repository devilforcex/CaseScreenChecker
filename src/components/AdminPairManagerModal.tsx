import React, { useMemo, useState } from 'react';
import { X, Plus, CheckCircle2, ShieldCheck, AlertCircle, Search, ListChecks, ArrowRightLeft, Database } from 'lucide-react';
import { PhoneModel, CompatibilityPair, AccessoryCategory, ConfidenceLevel } from '../types';
import { PRIORITY_CATALOG, type PriorityCatalogCandidate } from '../data/priorityCatalog';
import { normalizeQuery } from '../utils/modelSearch';

interface AdminPairManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  phoneModels: PhoneModel[];
  canVerify: boolean;
  onAddPair: (pair: CompatibilityPair) => Promise<void>;
  onAddModel: (model: PhoneModel) => Promise<void>;
  onOpenExternalResearch: (query: string) => void;
}

interface PriorityCatalogRow {
  candidate: PriorityCatalogCandidate;
  catalogModel?: PhoneModel;
}

function findCatalogModel(candidate: PriorityCatalogCandidate, phoneModels: PhoneModel[]): PhoneModel | undefined {
  const candidateFullName = normalizeQuery(candidate.fullName);
  const candidateName = normalizeQuery(candidate.name);
  const candidateAliases = new Set(candidate.aliases.map(normalizeQuery));

  return phoneModels.find((model) => {
    if (normalizeQuery(model.fullName) === candidateFullName) return true;
    if (normalizeQuery(model.brand) !== normalizeQuery(candidate.brand)) return false;
    return normalizeQuery(model.name) === candidateName
      || model.aliases.some((alias) => candidateAliases.has(normalizeQuery(alias)));
  });
}

export const AdminPairManagerModal: React.FC<AdminPairManagerModalProps> = ({
  isOpen,
  onClose,
  phoneModels,
  canVerify,
  onAddPair,
  onAddModel,
  onOpenExternalResearch,
}) => {
  const [activeTab, setActiveTab] = useState<'add-pair' | 'add-model' | 'priority-catalog'>('add-pair');

  // Pair form state
  const [sourceId, setSourceId] = useState(phoneModels[0]?.id || '');
  const [targetId, setTargetId] = useState(phoneModels[1]?.id || '');
  const [category, setCategory] = useState<AccessoryCategory>('screen_protector');
  const [confidenceLevel, setConfidenceLevel] = useState<ConfidenceLevel>('CONFIRMED_COMPATIBLE');
  const [confidenceScore, setConfidenceScore] = useState(95);
  const [fitNotes, setFitNotes] = useState('');
  const [caveats, setCaveats] = useState('');
  const [isVerified, setIsVerified] = useState(true);
  const [staffName, setStaffName] = useState('Store Staff Tech');
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Model form state
  const [newBrand, setNewBrand] = useState('Samsung');
  const [newName, setNewName] = useState('');
  const [newYear, setNewYear] = useState(2024);
  const [newHeight, setNewHeight] = useState(165.0);
  const [newWidth, setNewWidth] = useState(76.0);
  const [newThickness, setNewThickness] = useState(8.5);
  const [newScreenDiag, setNewScreenDiag] = useState(6.6);
  const [newNotch, setNewNotch] = useState<'punch_hole_center' | 'waterdrop_u' | 'dynamic_island' | 'wide_notch'>('punch_hole_center');
  const [newCurvature, setNewCurvature] = useState<'flat' | '2.5d_curved_edge' | 'waterfall_3d'>('flat');

  // Priority catalog queue state. These candidates deliberately contain recognition
  // data only; dimensions and compatibility claims are never inferred here.
  const [prioritySearch, setPrioritySearch] = useState('');
  const [priorityBrand, setPriorityBrand] = useState('All brands');

  const priorityBrands = useMemo(
    () => [...new Set(PRIORITY_CATALOG.map((candidate) => candidate.brand))].sort((left, right) => left.localeCompare(right)),
    [],
  );
  const priorityRows = useMemo<PriorityCatalogRow[]>(() => {
    const normalizedSearch = normalizeQuery(prioritySearch);
    return PRIORITY_CATALOG
      .map((candidate) => ({ candidate, catalogModel: findCatalogModel(candidate, phoneModels) }))
      .filter(({ candidate }) => priorityBrand === 'All brands' || candidate.brand === priorityBrand)
      .filter(({ candidate }) => !normalizedSearch || [candidate.fullName, candidate.name, candidate.brand, ...candidate.aliases]
        .map(normalizeQuery)
        .some((value) => value.includes(normalizedSearch)))
      .sort((left, right) => left.candidate.brand.localeCompare(right.candidate.brand)
        || right.candidate.releaseYear - left.candidate.releaseYear
        || left.candidate.fullName.localeCompare(right.candidate.fullName));
  }, [phoneModels, priorityBrand, prioritySearch]);
  const priorityGroups = useMemo(() => {
    return priorityRows.reduce<Record<string, PriorityCatalogRow[]>>((groups, row) => {
      (groups[row.candidate.brand] ??= []).push(row);
      return groups;
    }, {});
  }, [priorityRows]);
  const cataloguedPriorityCount = priorityRows.filter((row) => row.catalogModel).length;

  const selectPriorityModelForComparison = (model: PhoneModel, role: 'source' | 'target') => {
    if (role === 'source') setSourceId(model.id);
    else setTargetId(model.id);
    setActiveTab('add-pair');
  };

  if (!isOpen) return null;

  const handleSavePair = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sourceId || !targetId || sourceId === targetId) {
      alert('Please select two distinct phone models.');
      return;
    }

    const newPair: CompatibilityPair = {
      id: `pair-custom-${Date.now()}`,
      sourceModelId: sourceId,
      targetModelId: targetId,
      category,
      confidenceLevel,
      confidenceScore,
      fitNotes: fitNotes || 'Verified physical fit in store.',
      caveats: caveats || undefined,
      isVerifiedByStaff: isVerified,
      verifiedBy: staffName,
      verifiedDate: new Date().toISOString().split('T')[0]
    };

    setSaveError(null);
    setIsSaving(true);
    try {
      await onAddPair(newPair);
      onClose();
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : 'Could not save the compatibility pair.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveModel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) {
      alert('Please enter a model name.');
      return;
    }

    const brandFormatted = newBrand.trim();
    const model: PhoneModel = {
      id: `${brandFormatted.toLowerCase()}-${newName.toLowerCase().replace(/\s+/g, '-')}`,
      brand: brandFormatted,
      name: newName,
      fullName: `${brandFormatted} ${newName}`,
      releaseYear: newYear,
      dimensions: {
        height: Number(newHeight),
        width: Number(newWidth),
        thickness: Number(newThickness)
      },
      screen: {
        diagonalIn: Number(newScreenDiag),
        curvature: newCurvature,
        notchType: newNotch,
        aspectRatio: '20:9',
        hasCurvedEdges: newCurvature !== 'flat'
      },
      camera: {
        shape: 'rectangular_island',
        lensCount: 3,
        bumpHeightMm: 1.8,
        position: 'top_left'
      },
      features: {
        hasHeadphoneJack: true,
        fingerprint: 'side_power_button',
        portType: 'usb_c',
        buttonLayout: 'power_right_vol_right'
      },
      aliases: [`${brandFormatted} ${newName}`]
    };

    setSaveError(null);
    setIsSaving(true);
    try {
      await onAddModel(model);
      setActiveTab('add-pair');
      setSourceId(model.id);
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : 'Could not register the phone model.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-neutral-900 border border-neutral-800 rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800 bg-neutral-950/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-600/20 border border-purple-500/40 flex items-center justify-center text-purple-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-neutral-100">
                Store Catalog & Compatibility Verification Manager
              </h3>
              <p className="text-xs text-neutral-400">
                Record new in-store physical test pairings or register phone models
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800 transition-colors cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="flex items-center gap-2 overflow-x-auto px-4 sm:px-6 py-2.5 bg-neutral-950 border-b border-neutral-800 text-xs">
          <button
            onClick={() => setActiveTab('add-pair')}
            className={`px-4 py-1.5 rounded-xl font-medium transition-colors cursor-pointer ${
              activeTab === 'add-pair' ? 'bg-purple-600 text-white font-semibold' : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            Add / Verify Compatibility Pair
          </button>
          <button
            onClick={() => setActiveTab('add-model')}
            className={`px-4 py-1.5 rounded-xl font-medium transition-colors cursor-pointer ${
              activeTab === 'add-model' ? 'bg-purple-600 text-white font-semibold' : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            Register New Phone Model
          </button>
          <button
            onClick={() => setActiveTab('priority-catalog')}
            className={`shrink-0 px-4 py-1.5 rounded-xl font-medium transition-colors cursor-pointer ${
              activeTab === 'priority-catalog' ? 'tech-tab-active text-white font-semibold' : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            Priority Catalog · {PRIORITY_CATALOG.length}
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {saveError && <div role="alert" className="mb-4 flex items-center gap-2 rounded-xl border border-red-800 bg-red-950/50 p-3 text-xs text-red-200"><AlertCircle className="h-4 w-4 shrink-0" />{saveError}</div>}
          {activeTab === 'priority-catalog' ? (
            <section aria-labelledby="priority-catalog-heading" className="space-y-4">
              <header className="tech-panel rounded-2xl p-4 sm:p-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="tech-status-rail">
                    <p className="tech-kicker">Counter intake queue</p>
                    <h4 id="priority-catalog-heading" className="mt-1 flex items-center gap-2 text-base font-bold text-neutral-100">
                      <ListChecks className="h-4 w-4 text-red-400" />
                      Priority catalog
                    </h4>
                    <p className="mt-1 max-w-xl text-xs leading-relaxed text-neutral-400">
                      Common Bulgarian-market devices for quick recognition. Pending models always go through research and staff review before they can enter the catalog.
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-center font-mono text-[10px] sm:min-w-44">
                    <div className="rounded-lg border border-emerald-900/80 bg-emerald-950/30 px-2 py-2 text-emerald-300">
                      <strong className="block text-sm text-emerald-200">{cataloguedPriorityCount}</strong>
                      IN CATALOG
                    </div>
                    <div className="rounded-lg border border-amber-900/80 bg-amber-950/30 px-2 py-2 text-amber-300">
                      <strong className="block text-sm text-amber-200">{priorityRows.length - cataloguedPriorityCount}</strong>
                      PENDING REVIEW
                    </div>
                  </div>
                </div>
              </header>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_11rem]">
                <label className="relative block">
                  <span className="sr-only">Search priority catalog by model name, alias, or code</span>
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
                  <input
                    value={prioritySearch}
                    onChange={(event) => setPrioritySearch(event.target.value)}
                    placeholder="Find model, alias, or code — e.g. SM-A525F"
                    className="tech-input w-full rounded-xl border p-2.5 pl-10 text-sm text-neutral-100 placeholder:text-neutral-600 font-mono"
                  />
                </label>
                <label className="block">
                  <span className="sr-only">Filter priority catalog by brand</span>
                  <select
                    value={priorityBrand}
                    onChange={(event) => setPriorityBrand(event.target.value)}
                    className="tech-input w-full rounded-xl border p-2.5 text-sm text-neutral-200 font-mono"
                  >
                    <option>All brands</option>
                    {priorityBrands.map((brand) => <option key={brand}>{brand}</option>)}
                  </select>
                </label>
              </div>

              {priorityRows.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-neutral-700 bg-neutral-950/60 px-5 py-10 text-center">
                  <Database className="mx-auto h-6 w-6 text-neutral-600" />
                  <p className="mt-3 text-sm font-semibold text-neutral-300">No priority models match this lookup.</p>
                  <p className="mt-1 text-xs text-neutral-500">Try a brand, model name, or OEM code.</p>
                </div>
              ) : (
                <div className="space-y-4" aria-live="polite">
                  {Object.entries(priorityGroups).map(([brand, rows]) => (
                    <section key={brand} aria-labelledby={`priority-brand-${brand}`}>
                      <div className="mb-2 flex items-center gap-2">
                        <h5 id={`priority-brand-${brand}`} className="text-xs font-bold uppercase tracking-wider text-neutral-300">{brand}</h5>
                        <span className="font-mono text-[10px] text-neutral-600">{rows.length} MODELS</span>
                        <div className="h-px flex-1 bg-neutral-800" />
                      </div>
                      <div className="space-y-2">
                        {rows.map(({ candidate, catalogModel }) => (
                          <article key={candidate.fullName} className={`tech-card rounded-xl p-3 ${catalogModel ? 'border-emerald-900/65' : 'border-amber-900/55'}`}>
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                              <div className="min-w-0">
                                <div className="flex flex-wrap items-center gap-2">
                                  <h6 className="text-sm font-semibold text-neutral-100">{candidate.fullName}</h6>
                                  {catalogModel ? (
                                    <span className="rounded border border-emerald-800 bg-emerald-950/60 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-emerald-300">ALREADY IN CATALOG</span>
                                  ) : (
                                    <span className="rounded border border-amber-800 bg-amber-950/60 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-amber-300">PENDING REVIEW</span>
                                  )}
                                  <span className="font-mono text-[10px] text-neutral-500">{candidate.releaseYear} · {candidate.coverage.toUpperCase()}</span>
                                </div>
                                {candidate.aliases.length > 0 && (
                                  <p className="mt-1 truncate font-mono text-[10px] text-neutral-500" title={candidate.aliases.join(' · ')}>
                                    {candidate.aliases.join(' · ')}
                                  </p>
                                )}
                              </div>
                              {catalogModel ? (
                                <div className="grid shrink-0 grid-cols-2 gap-2 sm:flex">
                                  <button
                                    type="button"
                                    onClick={() => selectPriorityModelForComparison(catalogModel, 'source')}
                                    aria-label={`Use ${catalogModel.fullName} as the customer's phone in comparison`}
                                    className="rounded-lg border border-neutral-700 bg-neutral-900 px-2.5 py-2 text-[11px] font-semibold text-neutral-200 transition-colors hover:border-red-700 hover:text-white"
                                  >
                                    Set customer
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => selectPriorityModelForComparison(catalogModel, 'target')}
                                    aria-label={`Use ${catalogModel.fullName} as the donor model in comparison`}
                                    className="flex items-center justify-center gap-1 rounded-lg border border-red-800/80 bg-red-950/60 px-2.5 py-2 text-[11px] font-semibold text-red-200 transition-colors hover:bg-red-900"
                                  >
                                    <ArrowRightLeft className="h-3.5 w-3.5" /> Set donor
                                  </button>
                                </div>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => onOpenExternalResearch(candidate.fullName)}
                                  aria-label={`Research and review ${candidate.fullName} before adding it to the catalog`}
                                  className="shrink-0 rounded-lg border border-amber-700/80 bg-amber-950/60 px-3 py-2 text-[11px] font-semibold text-amber-200 transition-colors hover:bg-amber-900/60"
                                >
                                  Research &amp; review
                                </button>
                              )}
                            </div>
                          </article>
                        ))}
                      </div>
                    </section>
                  ))}
                </div>
              )}
            </section>
          ) : activeTab === 'add-pair' ? (
            <form onSubmit={handleSavePair} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Source Model */}
                <div>
                  <label className="block text-neutral-400 font-mono mb-1">Target Phone Model (Customer's Phone):</label>
                  <select
                    value={sourceId}
                    onChange={(e) => setSourceId(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-neutral-200 font-mono focus:border-purple-500"
                  >
                    {phoneModels.map(m => (
                      <option key={m.id} value={m.id}>{m.fullName}</option>
                    ))}
                  </select>
                </div>

                {/* Target Model */}
                <div>
                  <label className="block text-neutral-400 font-mono mb-1">Compatible Donor Model (Available In Stock):</label>
                  <select
                    value={targetId}
                    onChange={(e) => setTargetId(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-neutral-200 font-mono focus:border-purple-500"
                  >
                    {phoneModels.map(m => (
                      <option key={m.id} value={m.id}>{m.fullName}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Category */}
                <div>
                  <label className="block text-neutral-400 font-mono mb-1">Accessory Category:</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as AccessoryCategory)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-neutral-200 font-mono focus:border-purple-500"
                  >
                    <option value="screen_protector">Screen Protector</option>
                    <option value="phone_case">Phone Case</option>
                    <option value="all_accessories">All Accessories</option>
                  </select>
                </div>

                {/* Confidence Level */}
                <div>
                  <label className="block text-neutral-400 font-mono mb-1">Confidence Tier:</label>
                  <select
                    value={confidenceLevel}
                    onChange={(e) => setConfidenceLevel(e.target.value as ConfidenceLevel)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-neutral-200 font-mono focus:border-purple-500"
                  >
                    <option value="EXACT_MATCH">EXACT MATCH (100%)</option>
                    <option value="CONFIRMED_COMPATIBLE">CONFIRMED COMPATIBLE (90-99%)</option>
                    <option value="HIGHLY_LIKELY">HIGHLY LIKELY (75-89%)</option>
                    <option value="POSSIBLE_WITH_CAUTION">POSSIBLE WITH CAUTION (50-74%)</option>
                  </select>
                </div>

                {/* Confidence Score */}
                <div>
                  <label className="block text-neutral-400 font-mono mb-1">Confidence Score (0-100):</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={confidenceScore}
                    onChange={(e) => setConfidenceScore(Number(e.target.value))}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-neutral-200 font-mono"
                  />
                </div>
              </div>

              {/* Fit Notes */}
              <div>
                <label className="block text-neutral-400 font-mono mb-1">Fit Explanation (Why it fits):</label>
                <textarea
                  rows={2}
                  value={fitNotes}
                  onChange={(e) => setFitNotes(e.target.value)}
                  placeholder="e.g. Tempered glass matches 100% active display flat area and earpiece speaker cutout..."
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-neutral-200 font-mono focus:border-purple-500"
                />
              </div>

              {/* Caveats */}
              <div>
                <label className="block text-neutral-400 font-mono mb-1">Watch-out Warnings & Caveats:</label>
                <textarea
                  rows={2}
                  value={caveats}
                  onChange={(e) => setCaveats(e.target.value)}
                  placeholder="e.g. Screen protector fits; however cases are incompatible due to camera module thickness..."
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-neutral-200 font-mono focus:border-purple-500"
                />
              </div>

              {/* Staff Signature */}
              <div className="flex items-center gap-4 bg-neutral-950 p-3 rounded-xl border border-neutral-800">
                <label className="flex items-center gap-2 cursor-pointer text-neutral-300">
                  <input
                    type="checkbox"
                    checked={canVerify && isVerified}
                    onChange={(e) => setIsVerified(e.target.checked)}
                    disabled={!canVerify}
                    className="w-4 h-4 rounded text-purple-600 accent-purple-600"
                  />
                  <span>{canVerify ? 'Publish as verified compatibility' : 'Submit as staff-tested candidate (admin approval required)'}</span>
                </label>
                <input
                  type="text"
                  value={staffName}
                  onChange={(e) => setStaffName(e.target.value)}
                  placeholder="Staff member signature..."
                  className="flex-1 bg-neutral-900 border border-neutral-800 rounded-lg px-2.5 py-1 text-xs text-neutral-200 font-mono"
                />
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-semibold rounded-xl flex items-center gap-2 transition-colors cursor-pointer shadow-md"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  {isSaving ? 'Saving…' : 'Save Compatibility Pairing'}
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleSaveModel} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-neutral-400 font-mono mb-1">Brand:</label>
                  <input
                    type="text"
                    value={newBrand}
                    onChange={(e) => setNewBrand(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-neutral-200 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-neutral-400 font-mono mb-1">Model Name:</label>
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="e.g. Galaxy A06, Pixel 9"
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-neutral-200 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-neutral-400 font-mono mb-1">Release Year:</label>
                  <input
                    type="number"
                    value={newYear}
                    onChange={(e) => setNewYear(Number(e.target.value))}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-neutral-200 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-neutral-400 font-mono mb-1">Height (mm):</label>
                  <input
                    type="number"
                    step="0.1"
                    value={newHeight}
                    onChange={(e) => setNewHeight(Number(e.target.value))}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-neutral-200 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-neutral-400 font-mono mb-1">Width (mm):</label>
                  <input
                    type="number"
                    step="0.1"
                    value={newWidth}
                    onChange={(e) => setNewWidth(Number(e.target.value))}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-neutral-200 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-neutral-400 font-mono mb-1">Thickness (mm):</label>
                  <input
                    type="number"
                    step="0.1"
                    value={newThickness}
                    onChange={(e) => setNewThickness(Number(e.target.value))}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-neutral-200 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-neutral-400 font-mono mb-1">Screen Diagonal (in):</label>
                  <input
                    type="number"
                    step="0.05"
                    value={newScreenDiag}
                    onChange={(e) => setNewScreenDiag(Number(e.target.value))}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-neutral-200 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-neutral-400 font-mono mb-1">Screen Notch Type:</label>
                  <select
                    value={newNotch}
                    onChange={(e) => setNewNotch(e.target.value as any)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-neutral-200 font-mono"
                  >
                    <option value="punch_hole_center">Punch Hole Center</option>
                    <option value="waterdrop_u">Waterdrop / Infinity-U</option>
                    <option value="dynamic_island">Dynamic Island</option>
                    <option value="wide_notch">Wide Notch</option>
                  </select>
                </div>
                <div>
                  <label className="block text-neutral-400 font-mono mb-1">Screen Curvature:</label>
                  <select
                    value={newCurvature}
                    onChange={(e) => setNewCurvature(e.target.value as any)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-neutral-200 font-mono"
                  >
                    <option value="flat">Flat Screen Glass</option>
                    <option value="2.5d_curved_edge">2.5D Curved Edge</option>
                    <option value="waterfall_3d">3D Waterfall Curved</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-semibold rounded-xl flex items-center gap-2 transition-colors cursor-pointer shadow-md"
                >
                  <Plus className="w-4 h-4" />
                  {isSaving ? 'Saving…' : 'Register Phone Model'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
