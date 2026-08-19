import React, { useState } from 'react';
import {
  Globe,
  Search,
  Sparkles,
  ExternalLink,
  PlusCircle,
  CheckCircle,
  ShieldAlert,
  Star,
  Info,
  Clock
} from 'lucide-react';
import { WebResearchItem, PhoneModel, AccessoryCategory } from '../types';

interface ExternalResearchPanelProps {
  initialQuery?: string;
  onAddPairToLocal: (item: WebResearchItem) => void;
  existingModels: PhoneModel[];
}

const SIMULATED_RESEARCH_DATABASE: WebResearchItem[] = [
  {
    id: 'res-1',
    query: 'Xiaomi Poco X6 Neo',
    candidateName: 'Redmi Note 13R Pro',
    brand: 'Xiaomi',
    category: 'all_accessories',
    confidenceLevel: 'CONFIRMED_COMPATIBLE',
    confidenceScore: 95,
    sourceTitle: 'GSMArena OEM Rebrand Hardware Matrix',
    sourceUrl: 'https://gsmarena.com/specs/poco_x6_neo.php',
    evidenceSnippet: 'Chassis dimensions identical down to 0.05mm: 161.1 x 75.0 x 7.7 mm. Flat 6.67" OLED with centered punch hole. Screen glass and cases are 100% interchangeable.',
    specsSummary: '161.1 x 75.0 x 7.7 mm | 6.67" Flat OLED | Rectangular Island',
    credibility: 5,
    timestamp: '2024-03-15'
  },
  {
    id: 'res-2',
    query: 'Realme 12 5G',
    candidateName: 'Realme 12+ 5G',
    brand: 'Realme',
    category: 'screen_protector',
    confidenceLevel: 'CONFIRMED_COMPATIBLE',
    confidenceScore: 92,
    sourceTitle: 'Display Panel Supply Chain Analysis',
    sourceUrl: 'https://devicespecifications.com',
    evidenceSnippet: 'Both devices share identical 6.72" 1080x2400 flat front glass panels. Tempered screen protector fits with 100% active display coverage.',
    specsSummary: '6.72" 20:9 Flat LCD | Center Punch-Hole',
    credibility: 4,
    timestamp: '2024-03-10'
  },
  {
    id: 'res-3',
    query: 'Honor Magic6 Lite',
    candidateName: 'Honor X9b',
    brand: 'Honor',
    category: 'all_accessories',
    confidenceLevel: 'EXACT_MATCH',
    confidenceScore: 100,
    sourceTitle: 'Global Hardware Regional Aliases',
    sourceUrl: 'https://hihonor.com/specs',
    evidenceSnippet: 'Honor X9b is the exact international rebrand of Magic6 Lite. 163.6 x 75.5 x 8.0 mm. Circular camera matrix and 6.78" curved AMOLED match 100%.',
    specsSummary: '163.6 x 75.5 x 8.0 mm | 6.78" Curved AMOLED | Circular Island',
    credibility: 5,
    timestamp: '2024-02-28'
  },
  {
    id: 'res-4',
    query: 'Motorola Moto G24',
    candidateName: 'Moto G04',
    brand: 'Motorola',
    category: 'all_accessories',
    confidenceLevel: 'CONFIRMED_COMPATIBLE',
    confidenceScore: 98,
    sourceTitle: 'Motorola Chassis Mold Teardown',
    sourceUrl: 'https://motorola.com/smartphones',
    evidenceSnippet: 'Identical body mold (163.5 x 74.5 x 8.0 mm). Both screen protectors and TPU cases are 100% interchangeable.',
    specsSummary: '163.5 x 74.5 x 8.0 mm | 6.56" 90Hz LCD | Rectangular 2-ring bump',
    credibility: 5,
    timestamp: '2024-01-20'
  }
];

export const ExternalResearchPanel: React.FC<ExternalResearchPanelProps> = ({
  initialQuery = '',
  onAddPairToLocal,
  existingModels
}) => {
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [isSearching, setIsSearching] = useState(false);
  const [researchResults, setResearchResults] = useState<WebResearchItem[]>(SIMULATED_RESEARCH_DATABASE);
  const [addedIds, setAddedIds] = useState<string[]>([]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setTimeout(() => {
      const q = searchQuery.toLowerCase();
      const filtered = SIMULATED_RESEARCH_DATABASE.filter(
        item => item.query.toLowerCase().includes(q) ||
                item.candidateName.toLowerCase().includes(q) ||
                item.brand.toLowerCase().includes(q) ||
                item.evidenceSnippet.toLowerCase().includes(q)
      );

      if (filtered.length > 0) {
        setResearchResults(filtered);
      } else {
        // Generate simulated dynamic research candidate based on hardware catalog patterns
        const dynamicResearch: WebResearchItem = {
          id: `res-gen-${Date.now()}`,
          query: searchQuery,
          candidateName: `${searchQuery} Global / OEM Twin`,
          brand: 'Demo',
          category: 'screen_protector',
          confidenceLevel: 'HIGHLY_LIKELY',
          confidenceScore: 85,
          sourceTitle: 'Demo: simulated lookup (no live web data)',
          sourceUrl: 'https://gsmarena.com/search.php3',
          evidenceSnippet: `[SIMULATED] Placeholder demo result for "${searchQuery}". This is sample data, not a real web lookup.`,
          specsSummary: '6.6" Flat Display | Standard USB-C & Port Clearances',
          credibility: 4,
          timestamp: new Date().toISOString().split('T')[0]
        };
        setResearchResults([dynamicResearch]);
      }
      setIsSearching(false);
    }, 600);
  };

  const handleAdd = (item: WebResearchItem) => {
    onAddPairToLocal(item);
    setAddedIds(prev => [...prev, item.id]);
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
              External Web Research
              <span className="text-[10px] font-mono px-1.5 py-0.5 bg-amber-950 text-amber-400 rounded border border-amber-800 font-semibold">
                DEMO
              </span>
            </h3>
            <p className="text-xs text-neutral-400">
              <strong className="text-amber-400">Simulated data only.</strong> This panel demonstrates the planned research UI using sample data. No live web search is performed.
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
              placeholder="Search phone model for external research (e.g. Poco X6 Neo, Realme 12, Honor Magic6)..."
              className="w-full pl-10 pr-4 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-sm text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-blue-500 font-mono"
            />
          </div>
          <button
            type="submit"
            disabled={isSearching}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:bg-neutral-800 text-white text-xs font-semibold rounded-xl flex items-center gap-2 transition-colors cursor-pointer shadow-md"
          >
            {isSearching ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Searching demo data...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Search Demo Data</span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* DEMO disclaimer banner */}
      <div className="bg-amber-950/60 border border-amber-800/60 rounded-2xl p-4 flex items-start gap-3 text-xs">
        <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div className="text-neutral-300 space-y-1">
          <p className="font-semibold text-amber-300">
            DEMO MODE — simulated research data
          </p>
          <p className="text-neutral-400 leading-relaxed text-[11px]">
            All results below are hard-coded sample data. This panel does not perform live web research, and the confidence scores are illustrative, not real evidence. A future release will replace this with a real spec source and mark results as unverified until staff test them physically.
          </p>
        </div>
      </div>

      {/* Research Results Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400 font-mono">
            Research Candidates ({researchResults.length})
          </h4>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {researchResults.map((item) => {
            const isAdded = addedIds.includes(item.id);

            return (
              <div
                key={item.id}
                className="bg-neutral-900 border border-neutral-800 hover:border-neutral-700 rounded-2xl p-5 shadow-lg flex flex-col justify-between space-y-4 transition-all"
              >
                <div className="space-y-3">
                  {/* Card Header: Query Target vs Candidate */}
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-950 text-blue-400 border border-blue-800/60 font-semibold">
                        {item.brand}
                      </span>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-950 text-amber-400 border border-amber-800/60 font-semibold ml-1">
                        SIMULATED
                      </span>
                      <h5 className="text-base font-bold text-neutral-100 mt-1">
                        {item.query} <span className="text-neutral-500 font-normal">↔</span> {item.candidateName}
                      </h5>
                    </div>

                    <div className="text-right">
                      <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                        {item.confidenceScore}% Confidence
                      </span>
                      <div className="flex items-center justify-end gap-0.5 mt-1 text-amber-400">
                        {Array.from({ length: item.credibility }).map((_, i) => (
                          <Star key={i} className="w-3 h-3 fill-amber-400" />
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Physical Specs Summary */}
                  <div className="bg-neutral-950 p-2.5 rounded-xl border border-neutral-800 text-xs font-mono text-neutral-300">
                    <span className="text-neutral-500 block text-[10px]">Specs Summary:</span>
                    {item.specsSummary}
                  </div>

                  {/* Evidence Snippet */}
                  <div className="bg-neutral-950/60 p-3 rounded-xl border border-neutral-800/80 text-xs text-neutral-300">
                    <div className="flex items-center gap-1.5 text-blue-400 text-[11px] font-mono mb-1 font-semibold">
                      <Info className="w-3.5 h-3.5" />
                      <span>{item.sourceTitle}</span>
                    </div>
                    <p className="text-neutral-400 text-[11px] leading-relaxed">
                      "{item.evidenceSnippet}"
                    </p>
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="flex items-center justify-between pt-3 border-t border-neutral-800 text-xs">
                  <div className="flex items-center gap-1 text-neutral-500 text-[10px] font-mono">
                    <Clock className="w-3 h-3" />
                    <span>Discovered {item.timestamp}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleAdd(item)}
                      disabled={isAdded}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                        isAdded
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                          : 'bg-blue-600 hover:bg-blue-500 text-white shadow-md'
                      }`}
                    >
                      {isAdded ? (
                        <>
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Added to Catalog</span>
                        </>
                      ) : (
                        <>
                          <PlusCircle className="w-3.5 h-3.5" />
                          <span>Import to Store Reference</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
