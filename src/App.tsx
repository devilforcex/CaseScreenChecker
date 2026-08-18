import React, { useState, useMemo, useEffect } from 'react';
import {
  Smartphone,
  ShieldCheck,
  Globe,
  PlusCircle,
  BookOpen,
  Maximize2,
  Printer,
  Cpu,
  Languages
} from 'lucide-react';
import { PhoneModel, CompatibilityPair, AccessoryCategory, WebResearchItem } from './types';
import { INITIAL_PHONE_MODELS, INITIAL_COMPATIBILITY_PAIRS } from './data/phoneDatabase';
import { getCompatibilityResultsForModel } from './utils/compatibilityEngine';
import { PhoneSearchBar } from './components/PhoneSearchBar';
import { PhoneProfileCard } from './components/PhoneProfileCard';
import { CompatibilityResultsView } from './components/CompatibilityResultsView';
import { VisualOverlayModal } from './components/VisualOverlayModal';
import { ExternalResearchPanel } from './components/ExternalResearchPanel';
import { AdminPairManagerModal } from './components/AdminPairManagerModal';
import { ArchitectureDocsViewer } from './components/ArchitectureDocsViewer';
import { PrintableCheatSheetModal } from './components/PrintableCheatSheetModal';
import { BulkDataToolsModal } from './components/BulkDataToolsModal';
import { useLanguage } from './i18n/translations';

const STORAGE_KEY_MODELS = 'case_screen_checker_models_v1';
const STORAGE_KEY_PAIRS = 'case_screen_checker_pairs_v1';

export const App: React.FC = () => {
  const { language, setLanguage, t } = useLanguage();
  const [activeMainTab, setActiveMainTab] = useState<'checker' | 'research' | 'docs'>('checker');

  // Initialize state from localStorage if available, or fallback to default
  const [phoneModels, setPhoneModels] = useState<PhoneModel[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_MODELS);
      if (saved) return JSON.parse(saved);
    } catch (_) {}
    return INITIAL_PHONE_MODELS;
  });

  const [compatibilityPairs, setCompatibilityPairs] = useState<CompatibilityPair[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_PAIRS);
      if (saved) return JSON.parse(saved);
    } catch (_) {}
    return INITIAL_COMPATIBILITY_PAIRS;
  });

  // Save to localStorage on change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_MODELS, JSON.stringify(phoneModels));
    } catch (_) {}
  }, [phoneModels]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_PAIRS, JSON.stringify(compatibilityPairs));
    } catch (_) {}
  }, [compatibilityPairs]);

  const [selectedModel, setSelectedModel] = useState<PhoneModel>(phoneModels[0] || INITIAL_PHONE_MODELS[0]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('All');
  const [selectedCategory, setSelectedCategory] = useState<AccessoryCategory>('all_accessories');

  // Modal states
  const [overlayCandidate, setOverlayCandidate] = useState<PhoneModel | null>(null);
  const [isAddPairOpen, setIsAddPairOpen] = useState(false);
  const [isCheatSheetOpen, setIsCheatSheetOpen] = useState(false);
  const [isBulkToolsOpen, setIsBulkToolsOpen] = useState(false);

  // Compute live compatibility results
  const compatibilityResults = useMemo(() => {
    if (!selectedModel) return [];
    return getCompatibilityResultsForModel(
      selectedModel,
      phoneModels,
      compatibilityPairs,
      selectedCategory
    );
  }, [selectedModel, phoneModels, compatibilityPairs, selectedCategory]);

  const handleAddPair = (newPair: CompatibilityPair) => {
    setCompatibilityPairs(prev => [newPair, ...prev]);
  };

  const handleAddModel = (newModel: PhoneModel) => {
    setPhoneModels(prev => [...prev, newModel]);
    setSelectedModel(newModel);
  };

  const handleImportModels = (models: PhoneModel[]) => {
    setPhoneModels(prev => {
      const existingIds = new Set(prev.map(m => m.id));
      const newOnly = models.filter(m => !existingIds.has(m.id));
      return [...prev, ...newOnly];
    });
  };

  const handleAddTwinPairs = (pairs: CompatibilityPair[]) => {
    setCompatibilityPairs(prev => {
      const existingIds = new Set(prev.map(p => p.id));
      const newOnly = pairs.filter(p => !existingIds.has(p.id));
      return [...newOnly, ...prev];
    });
  };

  const handleAddFromResearch = (item: WebResearchItem) => {
    // Add new pairing from research evidence
    const targetModel = phoneModels.find(m => m.name.toLowerCase().includes(item.query.toLowerCase())) || selectedModel;
    
    // Check if candidate model exists or create a placeholder
    let candidate = phoneModels.find(m => m.name.toLowerCase().includes(item.candidateName.toLowerCase()));
    if (!candidate) {
      candidate = {
        id: `researched-${Date.now()}`,
        brand: item.brand,
        name: item.candidateName,
        fullName: `${item.brand} ${item.candidateName}`,
        releaseYear: 2024,
        dimensions: { height: 161.1, width: 75.0, thickness: 7.7 },
        screen: { diagonalIn: 6.67, curvature: 'flat', notchType: 'punch_hole_center', aspectRatio: '20:9', hasCurvedEdges: false },
        camera: { shape: 'rectangular_island', lensCount: 3, bumpHeightMm: 2.0, position: 'top_left' },
        features: { hasHeadphoneJack: true, fingerprint: 'side_power_button', portType: 'usb_c', buttonLayout: 'power_right_vol_right' },
        aliases: [item.candidateName]
      };
      setPhoneModels(prev => [...prev, candidate!]);
    }

    const pair: CompatibilityPair = {
      id: `pair-res-${Date.now()}`,
      sourceModelId: targetModel.id,
      targetModelId: candidate.id,
      category: item.category,
      confidenceLevel: item.confidenceLevel,
      confidenceScore: item.confidenceScore,
      fitNotes: item.evidenceSnippet,
      isVerifiedByStaff: false,
      evidenceSources: [
        {
          type: 'web_research',
          title: item.sourceTitle,
          url: item.sourceUrl,
          snippet: item.evidenceSnippet
        }
      ]
    };

    handleAddPair(pair);
    setSelectedModel(targetModel);
    setActiveMainTab('checker');
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col selection:bg-blue-600 selection:text-white">
      {/* Top Application Header */}
      <header className="sticky top-0 z-40 bg-neutral-900/90 backdrop-blur-md border-b border-neutral-800 shadow-sm print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Brand Logo & Tagline */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center shadow-lg shadow-blue-900/30 text-white font-black text-lg border border-blue-400/30">
                <Smartphone className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-base font-bold text-neutral-100 tracking-tight leading-none flex items-center gap-2">
                  {t.appName}
                  <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 bg-blue-950 text-blue-400 rounded border border-blue-800 font-semibold">
                    {t.versionBadge}
                  </span>
                </h1>
                <p className="text-[11px] text-neutral-400 mt-0.5">
                  {t.appSubtitle}
                </p>
              </div>
            </div>

            {/* Quick Actions & Navigation Bar */}
            <div className="flex items-center gap-2">
              {/* Language Switcher Button (BG / EN) */}
              <div className="flex items-center bg-neutral-800/90 rounded-xl p-1 border border-neutral-700 text-xs font-mono">
                <button
                  onClick={() => setLanguage('bg')}
                  className={`px-2 py-1 rounded-lg transition-colors cursor-pointer font-bold ${
                    language === 'bg'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-neutral-400 hover:text-neutral-200'
                  }`}
                  title="Български език"
                >
                  🇧🇬 BG
                </button>
                <button
                  onClick={() => setLanguage('en')}
                  className={`px-2 py-1 rounded-lg transition-colors cursor-pointer font-bold ${
                    language === 'en'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-neutral-400 hover:text-neutral-200'
                  }`}
                  title="English Language"
                >
                  🇬🇧 EN
                </button>
              </div>

              <button
                id="header-btn-cheat-sheet"
                onClick={() => setIsCheatSheetOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-950/80 hover:bg-blue-900 text-blue-300 border border-blue-800/80 text-xs font-semibold transition-colors cursor-pointer shadow-sm"
              >
                <Printer className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{t.printCheatSheet}</span>
              </button>

              <button
                id="header-btn-bulk-tools"
                onClick={() => setIsBulkToolsOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 text-xs font-semibold transition-colors cursor-pointer shadow-sm"
              >
                <Cpu className="w-3.5 h-3.5 text-purple-400" />
                <span className="hidden sm:inline">{t.oemTwinScanner}</span>
              </button>

              <button
                id="header-btn-add-pair"
                onClick={() => setIsAddPairOpen(true)}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-950/80 hover:bg-purple-900 text-purple-300 border border-purple-800/80 text-xs font-semibold transition-colors cursor-pointer shadow-sm"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>{t.addPair}</span>
              </button>

              <button
                onClick={() => {
                  if (!document.fullscreenElement) {
                    document.documentElement.requestFullscreen().catch(() => {});
                  } else {
                    document.exitFullscreen().catch(() => {});
                  }
                }}
                className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-800/80 hover:bg-neutral-700 text-neutral-300 text-xs font-medium border border-neutral-700 transition-colors cursor-pointer"
              >
                <Maximize2 className="w-3.5 h-3.5 text-blue-400" />
                {t.fullscreen}
              </button>
            </div>
          </div>

          {/* Primary View Navigation Tabs */}
          <div className="flex items-center space-x-1 overflow-x-auto pb-2 scrollbar-none">
            <button
              id="main-tab-checker"
              onClick={() => setActiveMainTab('checker')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeMainTab === 'checker'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-900/30'
                  : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/60'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>{t.tabChecker}</span>
            </button>

            <button
              id="main-tab-research"
              onClick={() => setActiveMainTab('research')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeMainTab === 'research'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-900/30'
                  : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/60'
              }`}
            >
              <Globe className="w-4 h-4" />
              <span>{t.tabResearch}</span>
            </button>

            <button
              id="main-tab-docs"
              onClick={() => setActiveMainTab('docs')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeMainTab === 'docs'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-900/30'
                  : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/60'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>{t.tabDocs}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {activeMainTab === 'checker' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Phone Model Search & Filter Section */}
            <PhoneSearchBar
              phoneModels={phoneModels}
              selectedModel={selectedModel}
              onSelectModel={(m) => setSelectedModel(m)}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              selectedBrand={selectedBrand}
              onBrandChange={setSelectedBrand}
            />

            {/* Target Phone Profile Specs */}
            {selectedModel && (
              <PhoneProfileCard model={selectedModel} />
            )}

            {/* Alternative Compatibility Results */}
            {selectedModel && (
              <CompatibilityResultsView
                targetModel={selectedModel}
                results={compatibilityResults}
                category={selectedCategory}
                onCategoryChange={setSelectedCategory}
                onOpenOverlay={(candidate) => setOverlayCandidate(candidate)}
                onOpenResearch={() => setActiveMainTab('research')}
                onOpenAddPair={() => setIsAddPairOpen(true)}
              />
            )}
          </div>
        )}

        {activeMainTab === 'research' && (
          <div className="animate-in fade-in duration-200">
            <ExternalResearchPanel
              initialQuery={selectedModel?.name || ''}
              onAddPairToLocal={handleAddFromResearch}
              existingModels={phoneModels}
            />
          </div>
        )}

        {activeMainTab === 'docs' && (
          <div className="animate-in fade-in duration-200">
            <ArchitectureDocsViewer />
          </div>
        )}
      </main>

      {/* Visual Overlay Modal */}
      {overlayCandidate && selectedModel && (
        <VisualOverlayModal
          isOpen={!!overlayCandidate}
          onClose={() => setOverlayCandidate(null)}
          targetModel={selectedModel}
          candidateModel={overlayCandidate}
        />
      )}

      {/* Admin Add / Verify Pairing Modal */}
      <AdminPairManagerModal
        isOpen={isAddPairOpen}
        onClose={() => setIsAddPairOpen(false)}
        phoneModels={phoneModels}
        onAddPair={handleAddPair}
        onAddModel={handleAddModel}
      />

      {/* Printable Cheat Sheet Modal */}
      <PrintableCheatSheetModal
        isOpen={isCheatSheetOpen}
        onClose={() => setIsCheatSheetOpen(false)}
        phoneModels={phoneModels}
        compatibilityPairs={compatibilityPairs}
      />

      {/* Bulk Data Tools & Automated OEM Twin Scanner Modal */}
      <BulkDataToolsModal
        isOpen={isBulkToolsOpen}
        onClose={() => setIsBulkToolsOpen(false)}
        phoneModels={phoneModels}
        compatibilityPairs={compatibilityPairs}
        onImportModels={handleImportModels}
        onAddTwinPairs={handleAddTwinPairs}
      />

      {/* Footer */}
      <footer className="border-t border-neutral-800 bg-neutral-900/60 py-4 text-center text-xs text-neutral-500 font-mono print:hidden">
        <p>{t.footerText}</p>
      </footer>
    </div>
  );
};

export default App;
