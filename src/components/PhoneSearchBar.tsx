import React from 'react';
import { Search, Smartphone, X } from 'lucide-react';
import { PhoneModel } from '../types';
import { useLanguage } from '../i18n/translations';

interface PhoneSearchBarProps {
  phoneModels: PhoneModel[];
  selectedModel: PhoneModel | null;
  onSelectModel: (model: PhoneModel) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedBrand: string;
  onBrandChange: (brand: string) => void;
}

export const PhoneSearchBar: React.FC<PhoneSearchBarProps> = ({
  phoneModels,
  selectedModel,
  onSelectModel,
  searchQuery,
  onSearchChange,
  selectedBrand,
  onBrandChange
}) => {
  const { t } = useLanguage();
  const brands = ['All', 'Samsung', 'Apple', 'Xiaomi', 'Motorola', 'Google'];

  const filteredModels = phoneModels.filter(model => {
    const matchesBrand = selectedBrand === 'All' || model.brand.toLowerCase() === selectedBrand.toLowerCase();
    const q = searchQuery.toLowerCase().trim();
    if (!q) return matchesBrand;

    const matchesName = model.name.toLowerCase().includes(q) || model.fullName.toLowerCase().includes(q);
    const matchesAlias = model.aliases.some(a => a.toLowerCase().includes(q));
    const matchesBrandText = model.brand.toLowerCase().includes(q);

    return matchesBrand && (matchesName || matchesAlias || matchesBrandText);
  });

  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 shadow-xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
        <div>
          <h2 className="text-base font-semibold text-neutral-100 flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-blue-500" />
            {t.selectModel}
          </h2>
          <p className="text-xs text-neutral-400 mt-0.5">
            {t.searchPlaceholder}
          </p>
        </div>

        {/* Brand Filter Chips */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {brands.map(b => (
            <button
              key={b}
              id={`brand-filter-${b.toLowerCase()}`}
              onClick={() => onBrandChange(b)}
              className={`px-3 py-1 text-xs font-medium rounded-lg transition-all cursor-pointer ${
                selectedBrand === b
                  ? 'bg-blue-600 text-white font-semibold shadow-sm'
                  : 'bg-neutral-800 text-neutral-400 hover:text-neutral-200 hover:bg-neutral-700'
              }`}
            >
              {b === 'All' ? t.allBrands : b}
            </button>
          ))}
        </div>
      </div>

      {/* Search Input Bar */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-500">
          <Search className="w-4 h-4" />
        </div>
        <input
          id="phone-search-input"
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={t.searchPlaceholder}
          className="w-full pl-10 pr-10 py-3 bg-neutral-950 border border-neutral-800 rounded-xl text-neutral-100 placeholder-neutral-500 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-mono transition-all"
        />
        {searchQuery && (
          <button
            onClick={() => onSearchChange('')}
            className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-neutral-500 hover:text-neutral-300 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Model Quick Select Pills */}
      <div className="mt-3 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <span className="text-[11px] text-neutral-500 font-mono shrink-0">{t.foundModels} ({filteredModels.length}):</span>
        {filteredModels.slice(0, 15).map(model => (
          <button
            key={model.id}
            id={`model-select-${model.id}`}
            onClick={() => onSelectModel(model)}
            className={`px-2.5 py-1 rounded-lg text-xs font-mono whitespace-nowrap transition-colors cursor-pointer ${
              selectedModel?.id === model.id
                ? 'bg-blue-600/30 text-blue-300 border border-blue-500/60 font-semibold'
                : 'bg-neutral-950/80 text-neutral-400 border border-neutral-800 hover:text-neutral-200 hover:border-neutral-700'
            }`}
          >
            {model.name}
          </button>
        ))}
      </div>
    </div>
  );
};
