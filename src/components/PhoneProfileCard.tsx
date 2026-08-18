import React from 'react';
import { Layers, Maximize, Camera, Sparkles, Volume2, Cpu, Tag } from 'lucide-react';
import { PhoneModel } from '../types';

interface PhoneProfileCardProps {
  model: PhoneModel;
}

export const PhoneProfileCard: React.FC<PhoneProfileCardProps> = ({ model }) => {
  return (
    <div className="bg-neutral-900/90 border border-neutral-800 rounded-2xl p-5 shadow-lg relative overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b border-neutral-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-blue-950 text-blue-400 border border-blue-800/60 font-semibold">
              {model.brand}
            </span>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-neutral-800 text-neutral-400 border border-neutral-700">
              Released {model.releaseYear}
            </span>
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
        <div className="bg-neutral-950/80 border border-neutral-800/80 rounded-xl p-3">
          <div className="flex items-center gap-1.5 text-neutral-400 text-xs mb-1">
            <Maximize className="w-3.5 h-3.5 text-blue-400" />
            <span>Chassis Size</span>
          </div>
          <p className="text-sm font-semibold text-neutral-200 font-mono">
            {model.dimensions.height} x {model.dimensions.width} mm
          </p>
          <p className="text-[11px] text-neutral-500 font-mono mt-0.5">
            Depth: {model.dimensions.thickness} mm {model.dimensions.weightG ? `(${model.dimensions.weightG}g)` : ''}
          </p>
        </div>

        {/* Screen */}
        <div className="bg-neutral-950/80 border border-neutral-800/80 rounded-xl p-3">
          <div className="flex items-center gap-1.5 text-neutral-400 text-xs mb-1">
            <Layers className="w-3.5 h-3.5 text-emerald-400" />
            <span>Screen Glass</span>
          </div>
          <p className="text-sm font-semibold text-neutral-200 font-mono">
            {model.screen.diagonalIn}" ({model.screen.curvature.replace('_', ' ')})
          </p>
          <p className="text-[11px] text-neutral-500 font-mono mt-0.5 capitalize">
            {model.screen.notchType.replace(/_/g, ' ')}
          </p>
        </div>

        {/* Camera */}
        <div className="bg-neutral-950/80 border border-neutral-800/80 rounded-xl p-3">
          <div className="flex items-center gap-1.5 text-neutral-400 text-xs mb-1">
            <Camera className="w-3.5 h-3.5 text-amber-400" />
            <span>Camera Setup</span>
          </div>
          <p className="text-sm font-semibold text-neutral-200 font-mono capitalize">
            {model.camera.shape.replace(/_/g, ' ')}
          </p>
          <p className="text-[11px] text-neutral-500 font-mono mt-0.5">
            {model.camera.lensCount} Lenses, {model.camera.bumpHeightMm}mm bump
          </p>
        </div>

        {/* Port & Hardware */}
        <div className="bg-neutral-950/80 border border-neutral-800/80 rounded-xl p-3">
          <div className="flex items-center gap-1.5 text-neutral-400 text-xs mb-1">
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span>Hardware I/O</span>
          </div>
          <p className="text-sm font-semibold text-neutral-200 font-mono uppercase">
            {model.features.portType}
          </p>
          <p className="text-[11px] text-neutral-500 font-mono mt-0.5">
            {model.features.hasHeadphoneJack ? '3.5mm Jack: Yes' : '3.5mm Jack: No'}
          </p>
        </div>
      </div>
    </div>
  );
};
