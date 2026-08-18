import React, { useState } from 'react';
import {
  X,
  Upload,
  Download,
  Cpu,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Smartphone,
  ShieldCheck
} from 'lucide-react';
import { PhoneModel, CompatibilityPair } from '../types';
import { calculateToleranceDiff } from '../utils/compatibilityEngine';
import { useLanguage } from '../i18n/translations';

interface BulkDataToolsModalProps {
  isOpen: boolean;
  onClose: () => void;
  phoneModels: PhoneModel[];
  compatibilityPairs: CompatibilityPair[];
  onImportModels: (models: PhoneModel[]) => void;
  onAddTwinPairs: (pairs: CompatibilityPair[]) => void;
}

export interface DetectedTwin {
  modelA: PhoneModel;
  modelB: PhoneModel;
  score: number;
  reason: string;
  alreadyPaired: boolean;
}

export const BulkDataToolsModal: React.FC<BulkDataToolsModalProps> = ({
  isOpen,
  onClose,
  phoneModels,
  compatibilityPairs,
  onImportModels,
  onAddTwinPairs
}) => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'scanner' | 'import' | 'export'>('scanner');
  const [importJsonText, setImportJsonText] = useState('');
  const [importStatus, setImportStatus] = useState<{ count: number; error?: string } | null>(null);

  if (!isOpen) return null;

  // Scan for OEM Twins automatically across all phone models
  const scanForOEMTwins = (): DetectedTwin[] => {
    const twins: DetectedTwin[] = [];

    for (let i = 0; i < phoneModels.length; i++) {
      for (let j = i + 1; j < phoneModels.length; j++) {
        const a = phoneModels[i];
        const b = phoneModels[j];

        const diff = calculateToleranceDiff(a, b);

        const isChassisTwin = diff.heightDeltaMm <= 0.3 && diff.widthDeltaMm <= 0.3 && diff.thicknessDeltaMm <= 0.3;
        const isScreenTwin = diff.screenDiagonalDeltaIn <= 0.05 && diff.screenCurvatureMatch;

        if (isChassisTwin && isScreenTwin) {
          const alreadyPaired = compatibilityPairs.some(
            p => (p.sourceModelId === a.id && p.targetModelId === b.id) ||
                 (p.sourceModelId === b.id && p.targetModelId === a.id)
          );

          twins.push({
            modelA: a,
            modelB: b,
            score: 100 - Math.round((diff.heightDeltaMm + diff.widthDeltaMm) * 10),
            reason: `Chassis delta ΔH: ${diff.heightDeltaMm}mm, ΔW: ${diff.widthDeltaMm}mm. Screen diagonal: ${a.screen.diagonalIn}" vs ${b.screen.diagonalIn}".`,
            alreadyPaired
          });
        }
      }
    }

    return twins;
  };

  const detectedTwins = scanForOEMTwins();

  const handleApplyAllTwins = () => {
    const newPairs: CompatibilityPair[] = detectedTwins
      .filter(t => !t.alreadyPaired)
      .map(t => ({
        id: `pair-twin-${t.modelA.id}-${t.modelB.id}`,
        sourceModelId: t.modelA.id,
        targetModelId: t.modelB.id,
        category: 'all_accessories',
        confidenceLevel: 'EXACT_MATCH',
        confidenceScore: t.score,
        fitNotes: `Identical OEM platform geometry detected by automated tolerance scanner. ${t.reason}`,
        isVerifiedByStaff: true,
        verifiedBy: 'OEM Twin Scanner',
        verifiedDate: new Date().toISOString().split('T')[0]
      }));

    if (newPairs.length > 0) {
      onAddTwinPairs(newPairs);
      alert(`Успешно добавени ${newPairs.length} нови хардуерни близнака!`);
    } else {
      alert('Всички засечени близнаци вече са регистрирани в базата данни.');
    }
  };

  const handleExecuteImport = () => {
    try {
      setImportStatus(null);
      const parsed = JSON.parse(importJsonText);
      if (!Array.isArray(parsed)) {
        setImportStatus({ count: 0, error: 'JSON трябва да бъде масив от обекти PhoneModel.' });
        return;
      }

      // Basic validation
      const validModels: PhoneModel[] = parsed.filter((m: any) => m.id && m.name && m.brand && m.dimensions && m.screen);

      if (validModels.length === 0) {
        setImportStatus({ count: 0, error: 'Няма валидни телефонни модели. Проверете задължителните полета (id, name, brand, dimensions, screen).' });
        return;
      }

      onImportModels(validModels);
      setImportStatus({ count: validModels.length });
      setImportJsonText('');
    } catch (err: any) {
      setImportStatus({ count: 0, error: `Грешка при четене на JSON: ${err.message}` });
    }
  };

  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(phoneModels, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `case_screen_checker_models_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-neutral-900 border border-neutral-800 rounded-3xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800 bg-neutral-950/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-600/20 border border-purple-500/40 flex items-center justify-center text-purple-400">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-neutral-100 flex items-center gap-2">
                {t.oemScannerTitle}
              </h3>
              <p className="text-xs text-neutral-400">
                {t.oemScannerSubtitle}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800 transition-colors cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="flex items-center gap-2 px-6 py-2.5 bg-neutral-950 border-b border-neutral-800 text-xs">
          <button
            onClick={() => setActiveTab('scanner')}
            className={`px-4 py-1.5 rounded-xl font-medium transition-colors cursor-pointer ${
              activeTab === 'scanner' ? 'bg-purple-600 text-white font-semibold' : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            {t.tabScanner} ({detectedTwins.length})
          </button>
          <button
            onClick={() => setActiveTab('import')}
            className={`px-4 py-1.5 rounded-xl font-medium transition-colors cursor-pointer ${
              activeTab === 'import' ? 'bg-purple-600 text-white font-semibold' : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            {t.tabImport}
          </button>
          <button
            onClick={() => setActiveTab('export')}
            className={`px-4 py-1.5 rounded-xl font-medium transition-colors cursor-pointer ${
              activeTab === 'export' ? 'bg-purple-600 text-white font-semibold' : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            {t.tabExport}
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'scanner' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-neutral-200">
                    {t.detectedTwins} ({detectedTwins.length})
                  </h4>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    Телефони с идентични размери и дисплей с под 0.3мм разлика.
                  </p>
                </div>
                <button
                  onClick={handleApplyAllTwins}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 cursor-pointer shadow-md"
                >
                  <Sparkles className="w-4 h-4" />
                  {t.autoRegisterTwins}
                </button>
              </div>

              {detectedTwins.length === 0 ? (
                <div className="p-8 text-center bg-neutral-950 rounded-2xl border border-neutral-800 text-neutral-400 text-xs">
                  Няма нерегистрирани хардуерни близнаци в текущия списък.
                </div>
              ) : (
                <div className="space-y-3">
                  {detectedTwins.map((twin, idx) => (
                    <div
                      key={idx}
                      className="bg-neutral-950 border border-neutral-800 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 font-bold text-neutral-100 font-mono">
                          <span className="text-blue-400">{twin.modelA.fullName}</span>
                          <span className="text-neutral-500 font-normal">↔</span>
                          <span className="text-emerald-400">{twin.modelB.fullName}</span>
                          {twin.alreadyPaired ? (
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                              {t.activePair}
                            </span>
                          ) : (
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800">
                              {t.discoveredNewTwin}
                            </span>
                          )}
                        </div>
                        <p className="text-neutral-400 text-[11px] font-mono">{twin.reason}</p>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-purple-400 bg-purple-950/70 border border-purple-800 px-2.5 py-1 rounded-lg">
                          {t.matchPercentage}: {twin.score}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'import' && (
            <div className="space-y-4 text-xs">
              <div>
                <h4 className="text-sm font-bold text-neutral-200">{t.importJsonTitle}</h4>
                <p className="text-xs text-neutral-400 mt-0.5">
                  {t.importJsonDesc}
                </p>
              </div>

              {importStatus && (
                <div className={`p-3 rounded-xl border flex items-center gap-2 ${
                  importStatus.error ? 'bg-red-950/50 border-red-800 text-red-300' : 'bg-emerald-950/50 border-emerald-800 text-emerald-300'
                }`}>
                  {importStatus.error ? <AlertCircle className="w-4 h-4 shrink-0" /> : <CheckCircle2 className="w-4 h-4 shrink-0" />}
                  <span>{importStatus.error || `Успешно импортирани ${importStatus.count} телефонни модела в каталога!`}</span>
                </div>
              )}

              <textarea
                rows={10}
                value={importJsonText}
                onChange={(e) => setImportJsonText(e.target.value)}
                placeholder='[
  {
    "id": "samsung-a06",
    "brand": "Samsung",
    "name": "Galaxy A06",
    "fullName": "Samsung Galaxy A06",
    "releaseYear": 2024,
    "dimensions": { "height": 167.3, "width": 77.3, "thickness": 8.0 },
    "screen": { "diagonalIn": 6.7, "curvature": "flat", "notchType": "waterdrop_u", "aspectRatio": "20:9" },
    "camera": { "shape": "individual_rings", "lensCount": 2, "bumpHeightMm": 1.2, "position": "top_left" },
    "features": { "hasHeadphoneJack": true, "fingerprint": "side_power_button", "portType": "usb_c", "buttonLayout": "power_right_vol_right" },
    "aliases": ["SM-A065F"]
  }
]'
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-xs font-mono text-neutral-200 focus:outline-none focus:border-purple-500"
              />

              <div className="flex justify-end">
                <button
                  onClick={handleExecuteImport}
                  className="px-5 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-semibold rounded-xl flex items-center gap-2 transition-colors cursor-pointer shadow-md"
                >
                  <Upload className="w-4 h-4" />
                  {t.importBtn}
                </button>
              </div>
            </div>
          )}

          {activeTab === 'export' && (
            <div className="space-y-4 text-xs">
              <div>
                <h4 className="text-sm font-bold text-neutral-200">{t.exportBackupTitle}</h4>
                <p className="text-xs text-neutral-400 mt-0.5">
                  {t.exportBackupDesc}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-neutral-950 border border-neutral-800 rounded-2xl p-5 space-y-3">
                  <div className="flex items-center gap-2 text-neutral-200 font-bold">
                    <Smartphone className="w-4 h-4 text-blue-400" />
                    <span>{t.tabImport} ({phoneModels.length} {t.foundModels.toLowerCase()})</span>
                  </div>
                  <p className="text-neutral-400 text-[11px]">
                    Пълен набор от хардуерни размери, екрани, камери и кодове.
                  </p>
                  <button
                    onClick={handleExportJSON}
                    className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-md"
                  >
                    <Download className="w-4 h-4" />
                    {t.downloadModelsJson}
                  </button>
                </div>

                <div className="bg-neutral-950 border border-neutral-800 rounded-2xl p-5 space-y-3">
                  <div className="flex items-center gap-2 text-neutral-200 font-bold">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>Съвместимости ({compatibilityPairs.length} двойки)</span>
                  </div>
                  <p className="text-neutral-400 text-[11px]">
                    Проверени връзки с нива на увереност, тестове, бележки и подписи.
                  </p>
                  <button
                    onClick={() => {
                      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(compatibilityPairs, null, 2));
                      const downloadAnchor = document.createElement('a');
                      downloadAnchor.setAttribute('href', dataStr);
                      downloadAnchor.setAttribute('download', `case_screen_checker_pairs_${new Date().toISOString().split('T')[0]}.json`);
                      downloadAnchor.appendChild(document.createTextNode(''));
                      document.body.appendChild(downloadAnchor);
                      downloadAnchor.click();
                      downloadAnchor.remove();
                    }}
                    className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-md"
                  >
                    <Download className="w-4 h-4" />
                    {t.downloadPairsJson}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
