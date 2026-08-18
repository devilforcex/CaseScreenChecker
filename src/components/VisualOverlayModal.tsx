import React, { useState } from 'react';
import { X, Layers, Sliders, Smartphone, ArrowRightLeft } from 'lucide-react';
import { PhoneModel } from '../types';
import { calculateToleranceDiff } from '../utils/compatibilityEngine';
import { useLanguage } from '../i18n/translations';

interface VisualOverlayModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetModel: PhoneModel;
  candidateModel: PhoneModel;
}

export const VisualOverlayModal: React.FC<VisualOverlayModalProps> = ({
  isOpen,
  onClose,
  targetModel,
  candidateModel
}) => {
  const { t } = useLanguage();
  const [overlayOpacity, setOverlayOpacity] = useState<number>(50);
  const [viewMode, setViewMode] = useState<'overlay' | 'side-by-side'>('overlay');
  const [activeLayer, setActiveLayer] = useState<'screen' | 'chassis' | 'camera'>('screen');

  if (!isOpen) return null;

  const diff = calculateToleranceDiff(targetModel, candidateModel);

  // Scaled dimensions for SVG visualization (scale factor: ~2.4 pixels per mm)
  const scale = 2.4;
  const targetW = targetModel.dimensions.width * scale;
  const targetH = targetModel.dimensions.height * scale;
  const candW = candidateModel.dimensions.width * scale;
  const candH = candidateModel.dimensions.height * scale;

  const maxCanvasW = 340;
  const maxCanvasH = 460;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-neutral-900 border border-neutral-800 rounded-3xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800 bg-neutral-950/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-neutral-100 flex items-center gap-2">
                {t.overlayTitle}
              </h3>
              <p className="text-xs text-neutral-400">
                {t.overlaySubtitle}: <span className="text-blue-400 font-semibold">{targetModel.name}</span> vs <span className="text-emerald-400 font-semibold">{candidateModel.name}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-3 bg-neutral-950 border-b border-neutral-800/80 text-xs">
          {/* View Mode Toggle */}
          <div className="flex items-center gap-1.5 bg-neutral-900 p-1 rounded-xl border border-neutral-800">
            <button
              onClick={() => setViewMode('overlay')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                viewMode === 'overlay' ? 'bg-blue-600 text-white' : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              Наслагване (Overlay)
            </button>
            <button
              onClick={() => setViewMode('side-by-side')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                viewMode === 'side-by-side' ? 'bg-blue-600 text-white' : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              Един до друг
            </button>
          </div>

          {/* Layer Focus Tabs */}
          <div className="flex items-center gap-1.5 bg-neutral-900 p-1 rounded-xl border border-neutral-800">
            <button
              onClick={() => setActiveLayer('screen')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                activeLayer === 'screen' ? 'bg-emerald-600 text-white' : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              {t.screenSpecs}
            </button>
            <button
              onClick={() => setActiveLayer('chassis')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                activeLayer === 'chassis' ? 'bg-emerald-600 text-white' : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              {t.dimensions}
            </button>
            <button
              onClick={() => setActiveLayer('camera')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                activeLayer === 'camera' ? 'bg-emerald-600 text-white' : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              {t.cameraSpecs}
            </button>
          </div>

          {/* Opacity Slider (When Overlay is active) */}
          {viewMode === 'overlay' && (
            <div className="flex items-center gap-2 bg-neutral-900 px-3 py-1.5 rounded-xl border border-neutral-800">
              <Sliders className="w-3.5 h-3.5 text-neutral-400" />
              <span className="text-neutral-400 font-mono">{t.overlayOpacityCandidate}</span>
              <input
                type="range"
                min="10"
                max="90"
                value={overlayOpacity}
                onChange={(e) => setOverlayOpacity(Number(e.target.value))}
                className="w-24 accent-emerald-500 cursor-pointer"
              />
              <span className="font-mono text-emerald-400 w-8">{overlayOpacity}%</span>
            </div>
          )}
        </div>

        {/* Modal Body / Visual Canvas */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="flex flex-col lg:flex-row items-center justify-center gap-8">
            {/* Visual Canvas */}
            <div className="bg-neutral-950 border border-neutral-800 rounded-2xl p-6 shadow-inner flex items-center justify-center min-h-[440px] min-w-[340px] relative">
              {viewMode === 'overlay' ? (
                /* Overlay Mode SVG */
                <svg width={maxCanvasW} height={maxCanvasH} className="overflow-visible">
                  {/* Legend / Background grid */}
                  <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                    <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#262626" strokeWidth="0.5" />
                  </pattern>
                  <rect width={maxCanvasW} height={maxCanvasH} fill="url(#grid)" rx="16" />

                  {/* Target Phone (Blue Silhouette) */}
                  <g transform={`translate(${(maxCanvasW - targetW) / 2}, ${(maxCanvasH - targetH) / 2})`}>
                    {/* Outer Chassis */}
                    <rect
                      width={targetW}
                      height={targetH}
                      rx={24}
                      fill="#1e3a8a"
                      fillOpacity="0.25"
                      stroke="#3b82f6"
                      strokeWidth="2.5"
                    />
                    {/* Screen Active Area */}
                    <rect
                      x={6}
                      y={10}
                      width={targetW - 12}
                      height={targetH - 20}
                      rx={16}
                      fill="#1e293b"
                      fillOpacity="0.4"
                      stroke="#60a5fa"
                      strokeWidth="1"
                      strokeDasharray="4 2"
                    />
                    {/* Notch / Camera Hole */}
                    <circle cx={targetW / 2} cy={18} r={5} fill="#60a5fa" />
                    {/* Camera Island Indicator on top left */}
                    <rect x={10} y={16} width={30} height={45} rx={8} fill="#3b82f6" fillOpacity="0.5" />
                  </g>

                  {/* Candidate Phone (Emerald Silhouette with adjustable opacity) */}
                  <g
                    transform={`translate(${(maxCanvasW - candW) / 2}, ${(maxCanvasH - candH) / 2})`}
                    opacity={overlayOpacity / 100}
                  >
                    <rect
                      width={candW}
                      height={candH}
                      rx={24}
                      fill="#065f46"
                      fillOpacity="0.3"
                      stroke="#10b981"
                      strokeWidth="2"
                      strokeDasharray="5 3"
                    />
                    {/* Candidate Screen */}
                    <rect
                      x={6}
                      y={10}
                      width={candW - 12}
                      height={candH - 20}
                      rx={16}
                      fill="#064e3b"
                      fillOpacity="0.4"
                      stroke="#34d399"
                      strokeWidth="1"
                    />
                    <circle cx={candW / 2} cy={18} r={5} fill="#34d399" />
                    {/* Candidate Camera Island */}
                    <rect x={10} y={16} width={32} height={48} rx={8} fill="#10b981" fillOpacity="0.6" />
                  </g>
                </svg>
              ) : (
                /* Side by Side Mode */
                <div className="flex items-center gap-6">
                  {/* Target Phone */}
                  <div className="flex flex-col items-center">
                    <span className="text-xs font-mono text-blue-400 font-semibold mb-2">
                      {targetModel.name}
                    </span>
                    <svg width={targetW} height={targetH} className="overflow-visible">
                      <rect
                        width={targetW}
                        height={targetH}
                        rx={24}
                        fill="#172554"
                        stroke="#3b82f6"
                        strokeWidth="2"
                      />
                      <rect
                        x={6}
                        y={10}
                        width={targetW - 12}
                        height={targetH - 20}
                        rx={16}
                        fill="#0f172a"
                        stroke="#60a5fa"
                        strokeWidth="1"
                      />
                      <circle cx={targetW / 2} cy={18} r={5} fill="#60a5fa" />
                      <rect x={10} y={16} width={28} height={42} rx={6} fill="#3b82f6" fillOpacity="0.6" />
                    </svg>
                    <span className="text-[11px] font-mono text-neutral-400 mt-2">
                      {targetModel.dimensions.height} x {targetModel.dimensions.width} mm
                    </span>
                  </div>

                  {/* Candidate Phone */}
                  <div className="flex flex-col items-center">
                    <span className="text-xs font-mono text-emerald-400 font-semibold mb-2">
                      {candidateModel.name}
                    </span>
                    <svg width={candW} height={candH} className="overflow-visible">
                      <rect
                        width={candW}
                        height={candH}
                        rx={24}
                        fill="#064e3b"
                        stroke="#10b981"
                        strokeWidth="2"
                      />
                      <rect
                        x={6}
                        y={10}
                        width={candW - 12}
                        height={candH - 20}
                        rx={16}
                        fill="#022c22"
                        stroke="#34d399"
                        strokeWidth="1"
                      />
                      <circle cx={candW / 2} cy={18} r={5} fill="#34d399" />
                      <rect x={10} y={16} width={30} height={46} rx={6} fill="#10b981" fillOpacity="0.6" />
                    </svg>
                    <span className="text-[11px] font-mono text-neutral-400 mt-2">
                      {candidateModel.dimensions.height} x {candidateModel.dimensions.width} mm
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Differential Data Panel */}
            <div className="w-full lg:w-80 space-y-3">
              <div className="bg-neutral-950 border border-neutral-800 rounded-2xl p-4 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400 font-mono flex items-center gap-2">
                  <ArrowRightLeft className="w-3.5 h-3.5 text-blue-400" />
                  {t.toleranceDiff}
                </h4>

                {/* Height Diff */}
                <div className="flex items-center justify-between text-xs py-1.5 border-b border-neutral-900 font-mono">
                  <span className="text-neutral-400">{t.height}:</span>
                  <span className={`font-semibold ${diff.heightDeltaMm <= 0.5 ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {diff.heightDeltaMm} mm {diff.heightDeltaMm <= 0.5 ? '✓ (Пасва)' : '⚠️ (Стегнато)'}
                  </span>
                </div>

                {/* Width Diff */}
                <div className="flex items-center justify-between text-xs py-1.5 border-b border-neutral-900 font-mono">
                  <span className="text-neutral-400">{t.width}:</span>
                  <span className={`font-semibold ${diff.widthDeltaMm <= 0.4 ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {diff.widthDeltaMm} mm {diff.widthDeltaMm <= 0.4 ? '✓ (Пасва)' : '⚠️ (Разлика)'}
                  </span>
                </div>

                {/* Screen Glass */}
                <div className="flex items-center justify-between text-xs py-1.5 border-b border-neutral-900 font-mono">
                  <span className="text-neutral-400">{t.screenSpecs}:</span>
                  <span className={`font-semibold ${diff.screenDiagonalDeltaIn === 0 ? 'text-emerald-400' : 'text-blue-400'}`}>
                    {diff.screenDiagonalDeltaIn === 0 ? '0.0" (Точно съвпадение)' : `${diff.screenDiagonalDeltaIn}"`}
                  </span>
                </div>

                {/* Curvature */}
                <div className="flex items-center justify-between text-xs py-1.5 border-b border-neutral-900 font-mono">
                  <span className="text-neutral-400">{t.curvature}:</span>
                  <span className="text-neutral-200 capitalize">
                    {candidateModel.screen.curvature.replace('_', ' ')}
                  </span>
                </div>

                {/* Camera Shape */}
                <div className="flex items-center justify-between text-xs py-1.5 font-mono">
                  <span className="text-neutral-400">{t.cameraShape}:</span>
                  <span className={`capitalize ${diff.cameraShapeMatch ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {candidateModel.camera.shape.replace(/_/g, ' ')}
                  </span>
                </div>
              </div>

              {/* Retail Recommendation Box */}
              <div className="bg-blue-950/30 border border-blue-900/50 rounded-2xl p-4 text-xs space-y-2">
                <div className="font-semibold text-blue-300 flex items-center gap-1.5">
                  <Smartphone className="w-4 h-4 text-blue-400" />
                  Препоръка за търговеца
                </div>
                <p className="text-neutral-300 leading-relaxed">
                  {diff.heightDeltaMm <= 0.5 && diff.widthDeltaMm <= 0.4
                    ? `Силиконов TPU кейс и стъклен протектор от ${candidateModel.name} могат сигурно да бъдат предложени на клиента.`
                    : `Стъкленият протектор пасва точно. Избягвайте твърди пластмасови калъфи от ${candidateModel.name} поради леки разлики в шасито.`}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 bg-neutral-950 border-t border-neutral-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
          >
            {t.close}
          </button>
        </div>
      </div>
    </div>
  );
};
