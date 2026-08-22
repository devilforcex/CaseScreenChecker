import React from 'react';
import { Layers, Maximize, Camera, Cpu, Tag } from 'lucide-react';
import { PhoneModel } from '../types';
import { useLanguage } from '../i18n/translations';

interface PhoneProfileCardProps {
  model: PhoneModel;
}

export const PhoneProfileCard: React.FC<PhoneProfileCardProps> = ({ model }) => {
  const { t } = useLanguage();

  return (
    <section aria-label={`${model.fullName} specifications`} className="tech-panel rounded-xl p-4 sm:p-5 shadow-lg relative overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b border-neutral-800">
        <div className="tech-status-rail">
          <p className="tech-kicker mb-2">Selected device / physical profile</p>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-red-950/70 text-red-300 border border-red-800/70 font-semibold">
              {model.brand}
            </span>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-neutral-800 text-neutral-400 border border-neutral-700">
              {model.releaseYear}
            </span>
            {/* Verified specs badge removed — it was misleading.
                Only staff-verified *pairs* should show a verification badge,
                not individual models. */}
          </div>
          <h3 className="text-xl font-bold text-neutral-100 tracking-tight">
            {model.fullName}
          </h3>
          {model.notes && (
            <p className="text-xs text-neutral-400 mt-1">
              {model.notes}
            </p>
          )}
        </div>

        {/* Model Aliases */}
        {model.aliases.length > 0 && (
          <div className="flex items-center gap-1 flex-wrap sm:justify-end">
            <Tag className="w-3.5 h-3.5 text-neutral-500 mr-0.5" />
            <span className="text-[11px] text-neutral-500 font-mono mr-1">{t.aliases}</span>
            {model.aliases.map((alias) => (
              <span
                key={alias}
                className="text-[10px] font-mono px-1.5 py-0.5 bg-neutral-800 text-neutral-300 rounded border border-neutral-700/80"
              >
                {alias}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Grid of Hardware Physical Parameters */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
        {/* Dimensions */}
        <div className="tech-card rounded-lg p-3">
          <div className="flex items-center gap-1.5 text-neutral-400 text-xs mb-1">
            <Maximize className="w-3.5 h-3.5 text-red-400" />
            <span>{t.dimensions}</span>
          </div>
          <p className="text-sm font-semibold text-neutral-200 font-mono">
            {model.dimensions.height} x {model.dimensions.width} mm
          </p>
          <p className="text-[11px] text-neutral-500 font-mono mt-0.5">
            {t.thickness}: {model.dimensions.thickness} mm {model.dimensions.weightG ? `(${model.dimensions.weightG}g)` : ''}
          </p>
        </div>

        {/* Screen */}
        <div className="tech-card rounded-lg p-3">
          <div className="flex items-center gap-1.5 text-neutral-400 text-xs mb-1">
            <Layers className="w-3.5 h-3.5 text-emerald-400" />
            <span>{t.screenSpecs}</span>
          </div>
          <p className="text-sm font-semibold text-neutral-200 font-mono">
            {model.screen.diagonalIn}&quot; • {model.screen.curvature.toUpperCase()}
          </p>
          <p className="text-[11px] text-neutral-500 font-mono mt-0.5">
            {t.notch}: {model.screen.notchType.replace(/_/g, ' ')}
          </p>
          <p className={`text-[10px] font-mono mt-1 ${model.screen.widthMm !== undefined && model.screen.heightMm !== undefined ? 'text-emerald-400' : 'text-amber-400'}`}>
            {model.screen.widthMm !== undefined && model.screen.heightMm !== undefined
              ? `glass: ${model.screen.widthMm} × ${model.screen.heightMm} mm`
              : 'glass geometry: measure required'}
          </p>
        </div>

        {/* Camera Module */}
        <div className="tech-card rounded-lg p-3">
          <div className="flex items-center gap-1.5 text-neutral-400 text-xs mb-1">
            <Camera className="w-3.5 h-3.5 text-red-400" />
            <span>{t.cameraSpecs}</span>
          </div>
          <p className="text-sm font-semibold text-neutral-200 font-mono capitalize">
            {model.camera.shape.replace(/_/g, ' ')}
          </p>
          <p className="text-[11px] text-neutral-500 font-mono mt-0.5">
            {model.camera.lensCount} {t.lensCount} • {t.bumpHeight}: {model.camera.bumpHeightMm}mm
          </p>
        </div>

        {/* Hardware Features */}
        <div className="tech-card rounded-lg p-3">
          <div className="flex items-center gap-1.5 text-neutral-400 text-xs mb-1">
            <Cpu className="w-3.5 h-3.5 text-red-400" />
            <span>{t.hardwareFeatures}</span>
          </div>
          <p className="text-xs font-semibold text-neutral-200 font-mono">
            {model.features.portType.toUpperCase()} • {model.features.fingerprint.replace(/_/g, ' ')}
          </p>
          <p className="text-[11px] text-neutral-500 font-mono mt-0.5">
            3.5mm: {model.features.hasHeadphoneJack ? t.yes : t.no}
          </p>
        </div>
      </div>
    </section>
  );
};
