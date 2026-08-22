import React from 'react';
import {
  ShieldCheck,
  Smartphone,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  Eye,
  Check,
  Layers,
  Sparkles
} from 'lucide-react';
import { CompatibilityResult, AccessoryCategory, ConfidenceLevel, PhoneModel } from '../types';
import { useLanguage } from '../i18n/translations';

interface CompatibilityResultsViewProps {
  targetModel: PhoneModel;
  results: CompatibilityResult[];
  category: AccessoryCategory;
  onCategoryChange: (cat: AccessoryCategory) => void;
  onOpenOverlay: (candidate: PhoneModel) => void;
  onOpenAddPair: () => void;
  onOpenExternalResearch?: (query: string) => void;
}

export const CompatibilityResultsView: React.FC<CompatibilityResultsViewProps> = ({
  targetModel,
  results,
  category,
  onCategoryChange,
  onOpenOverlay,
  onOpenAddPair,
  onOpenExternalResearch,
}) => {
  const { t } = useLanguage();

  const getBadgeStyle = (level: ConfidenceLevel) => {
    switch (level) {
      case 'EXACT_MATCH':
        return 'bg-emerald-950 text-emerald-300 border-emerald-700/60';
      case 'CONFIRMED_COMPATIBLE':
        return 'bg-green-950 text-green-300 border-green-700/60';
      case 'HIGHLY_LIKELY':
        return 'bg-blue-950 text-blue-300 border-blue-700/60';
      case 'POSSIBLE_WITH_CAUTION':
        return 'bg-amber-950 text-amber-300 border-amber-700/60';
      case 'NOT_COMPATIBLE':
        return 'bg-red-950 text-red-300 border-red-700/60';
      default:
        return 'bg-neutral-800 text-neutral-300 border-neutral-700';
    }
  };

  const getTranslatedLevel = (level: ConfidenceLevel) => {
    switch (level) {
      case 'EXACT_MATCH':
        return t.exactMatch;
      case 'CONFIRMED_COMPATIBLE':
        return t.confirmedCompatible;
      case 'HIGHLY_LIKELY':
        return t.highlyLikely;
      case 'POSSIBLE_WITH_CAUTION':
        return t.possibleWithCaution;
      case 'NOT_COMPATIBLE':
        return t.notCompatible;
      default:
        return level;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 95) return 'text-emerald-400 bg-emerald-500';
    if (score >= 80) return 'text-green-400 bg-green-500';
    if (score >= 65) return 'text-blue-400 bg-blue-500';
    if (score >= 45) return 'text-amber-400 bg-amber-500';
    return 'text-red-400 bg-red-500';
  };

  const exactCount = results.filter(r => r.confidenceLevel === 'EXACT_MATCH' || r.confidenceLevel === 'CONFIRMED_COMPATIBLE').length;
  const likelyCount = results.filter(r => r.confidenceLevel === 'HIGHLY_LIKELY').length;
  const cautionCount = results.filter(r => r.confidenceLevel === 'POSSIBLE_WITH_CAUTION').length;

  return (
    <div className="space-y-4">
      {/* Category Tabs & Quick Summary Bar */}
      <section aria-label="Compatibility categories" className="tech-panel flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl p-3 sm:px-4">
        {/* Category Selector Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-neutral-950 rounded-xl border border-neutral-800">
          <button
            id="tab-screen-protectors"
            onClick={() => onCategoryChange('screen_protector')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              category === 'screen_protector'
                ? 'tech-tab-active text-white'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-red-300" />
            <span>{t.screenProtectors}</span>
          </button>

          <button
            id="tab-phone-cases"
            onClick={() => onCategoryChange('phone_case')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              category === 'phone_case'
                ? 'tech-tab-active text-white'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5 text-red-300" />
            <span>{t.phoneCases}</span>
          </button>

          <button
            id="tab-all-accessories"
            onClick={() => onCategoryChange('all_accessories')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              category === 'all_accessories'
                ? 'tech-tab-active text-white'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-red-300" />
            <span>{t.allAccessories}</span>
          </button>
        </div>

        {/* Quick Fit Count Badges */}
        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="px-2 py-1 bg-emerald-950/80 border border-emerald-800/60 rounded-md text-emerald-300">
            {exactCount} {t.exactMatch}
          </span>
          <span className="px-2 py-1 bg-neutral-800/90 border border-neutral-700 rounded-md text-neutral-200">
            {likelyCount} {t.highlyLikely}
          </span>
          {cautionCount > 0 && (
            <span className="px-2 py-1 bg-amber-950/80 border border-amber-800/60 rounded-md text-amber-300">
              {cautionCount} {t.possibleWithCaution}
            </span>
          )}
        </div>
      </section>

      {/* Results List */}
      {results.length === 0 ? (
        <div className="tech-panel rounded-xl border-dashed p-8 sm:p-10 text-center space-y-4">
          <div className="w-12 h-12 rounded-xl bg-neutral-800 flex items-center justify-center mx-auto text-red-300 border border-neutral-700">
            <HelpCircle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-neutral-200">{t.noMatchesFound}</h3>
            <p className="text-xs text-neutral-400 max-w-md mx-auto mt-1">
              {t.noMatchesPrompt} ({targetModel.name})
            </p>
          </div>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <button
              type="button"
              onClick={() => onOpenExternalResearch?.(targetModel.fullName)}
              disabled={!onOpenExternalResearch}
              className="px-4 py-2 bg-red-950/70 hover:bg-red-900 disabled:bg-neutral-800 disabled:text-neutral-500 text-red-200 disabled:cursor-not-allowed text-xs font-semibold rounded-lg flex items-center gap-2 cursor-pointer border border-red-800/70 disabled:border-neutral-700"
              title={onOpenExternalResearch ? 'Search external phone specifications' : 'Online research is unavailable'}
            >
              <Sparkles className="w-4 h-4" />
              Search online
            </button>
            <button
              onClick={onOpenAddPair}
              className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-semibold rounded-lg cursor-pointer border border-neutral-700"
            >
              {t.addPairManuallyBtn}
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-sm font-semibold text-neutral-300 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-red-400" />
              {t.compatibleAlternatives}
            </h3>
            <span className="text-xs text-neutral-500 font-mono">
              {results.length} {t.foundModels.toLowerCase()}
            </span>
          </div>

          {results.map((res, index) => {
            const candidate = res.candidateModel;
            const diff = res.diff;

            return (
              <div
                key={`${candidate.id}-${index}`}
                className="tech-panel rounded-xl p-4 sm:p-5 shadow-lg transition-all"
              >
                {/* Header Row: Candidate Name, Confidence Badge & Score */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-neutral-800">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-neutral-800 flex items-center justify-center font-bold text-sm text-neutral-200 border border-neutral-700 font-mono">
                      {candidate.brand.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-mono text-neutral-400">{candidate.brand}</span>
                        <span className="text-xs text-neutral-600">•</span>
                        <span className="text-xs font-mono text-neutral-400">{candidate.releaseYear}</span>
                        {res.isVerifiedByStaff && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                            {t.staffVerified}
                          </span>
                        )}
                      </div>
                      <h4 className="text-base font-bold text-neutral-100 flex items-center gap-2">
                        {candidate.fullName}
                      </h4>
                    </div>
                  </div>

                  {/* Badges & Actions */}
                  <div className="flex items-center gap-3 justify-between sm:justify-end">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`text-[11px] font-mono font-bold px-2.5 py-1 rounded-lg border uppercase ${getBadgeStyle(res.confidenceLevel)}`}>
                        {getTranslatedLevel(res.confidenceLevel)}
                      </span>

                      {/* Score Gauge */}
                      <div className="flex items-center gap-1.5 px-2.5 py-1 bg-neutral-950 border border-neutral-800 rounded-lg">
                        <span className="text-xs text-neutral-400 font-mono">{t.confidenceScore}:</span>
                        <span className={`text-xs font-mono font-black ${getScoreColor(res.confidenceScore).split(' ')[0]}`}>
                          {res.confidenceScore}%
                        </span>
                      </div>
                    </div>

                    {/* Compare Overlay Button */}
                    <button
                      id={`compare-overlay-${candidate.id}`}
                      onClick={() => onOpenOverlay(candidate)}
                      className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-medium rounded-lg flex items-center gap-1.5 border border-neutral-700 transition-colors cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5 text-red-400" />
                      <span>{t.visualOverlay}</span>
                    </button>
                  </div>
                </div>

                {/* Body: Dimensional Tolerances & Physical Match Matrix */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 py-3">
                  {/* Chassis Dimension Delta */}
                  <div className="tech-card p-2.5 rounded-lg">
                    <span className="text-[11px] text-neutral-500 font-mono block">{t.toleranceDiff}</span>
                    <span className="text-xs font-mono font-semibold text-neutral-200">
                      ΔH: {diff.heightDeltaMm}mm | ΔW: {diff.widthDeltaMm}mm
                    </span>
                    <span className="text-[10px] text-neutral-500 font-mono block mt-0.5">
                      {t.thickness}: {diff.thicknessDeltaMm}mm
                    </span>
                  </div>

                  {/* Screen Glass Delta */}
                  <div className="tech-card p-2.5 rounded-lg">
                    <span className="text-[11px] text-neutral-500 font-mono block">{t.screenSpecs}</span>
                    <span className="text-xs font-mono font-semibold text-neutral-200">
                      {candidate.screen.diagonalIn}&quot; ({diff.screenDiagonalDeltaIn === 0 ? t.exactMatch : `Δ ${diff.screenDiagonalDeltaIn}"`})
                    </span>
                    <span className="text-[10px] text-neutral-400 font-mono block mt-0.5 capitalize">
                      {candidate.screen.notchType.replace(/_/g, ' ')}
                    </span>
                  </div>

                  {/* Camera Fit */}
                  <div className="tech-card p-2.5 rounded-lg">
                    <span className="text-[11px] text-neutral-500 font-mono block">{t.cameraSpecs}</span>
                    <span className="text-xs font-mono font-semibold text-neutral-200 capitalize">
                      {candidate.camera.shape.replace(/_/g, ' ')}
                    </span>
                    <span className="text-[10px] text-neutral-400 font-mono block mt-0.5">
                      {candidate.camera.lensCount} {t.lensCount} ({candidate.camera.bumpHeightMm}mm)
                    </span>
                  </div>

                  {/* Hardware / Port */}
                  <div className="tech-card p-2.5 rounded-lg">
                    <span className="text-[11px] text-neutral-500 font-mono block">{t.hardwareFeatures}</span>
                    <span className="text-xs font-mono font-semibold text-neutral-200 uppercase">
                      {candidate.features.portType}
                    </span>
                    <span className="text-[10px] text-neutral-400 font-mono block mt-0.5">
                      {candidate.features.hasHeadphoneJack ? `3.5mm: ${t.yes}` : `3.5mm: ${t.no}`}
                    </span>
                  </div>
                </div>

                {/* Explanations & Retail Staff Notes */}
                <div className="space-y-2 pt-2 text-xs">
                  {/* Positive fit notes */}
                  <div className="flex items-start gap-2 bg-emerald-950/30 border border-emerald-900/40 rounded-xl p-2.5 text-emerald-200">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold text-emerald-300">{t.fitAnalysis} </span>
                      <span>{res.fitNotes}</span>
                    </div>
                  </div>

                  {/* Caveats / Warning */}
                  {res.caveats && (
                    <div className="flex items-start gap-2 bg-amber-950/30 border border-amber-900/40 rounded-xl p-2.5 text-amber-200">
                      <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-semibold text-amber-300">{t.caveats} </span>
                        <span>{res.caveats}</span>
                      </div>
                    </div>
                  )}

                  {/* Evidence Citations if present */}
                  {res.evidenceSources && res.evidenceSources.length > 0 && (
                    <div className="pt-1">
                      <div className="text-[11px] font-mono text-neutral-500 mb-1">{t.viewEvidence}:</div>
                      <div className="space-y-1">
                        {res.evidenceSources.map((ev, i) => (
                          <div key={i} className="text-[11px] bg-neutral-950 p-2 rounded-lg border border-neutral-800 text-neutral-300 font-mono">
                            <span className="text-red-300 font-semibold">[{ev.type.toUpperCase()}]: </span>
                            <span className="text-neutral-200 font-medium">{ev.title}</span>
                            <p className="text-neutral-400 mt-0.5 text-[10px]">{ev.snippet}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
