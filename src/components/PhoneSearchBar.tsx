import React from 'react';
import { Search, Smartphone, X } from 'lucide-react';
import { PhoneModel } from '../types';

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
  const brands = ['All', 'Samsung', 'Apple', 'Xiaomi', 'Motorola'];

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
            Select Target Phone Model
          </h2>
          <p className="text-xs text-neutral-400 mt-0.5">
            Search by model name, commercial alias, or hardware code (e.g. A05s, iPhone 14, SM-A146B, Redmi 13C)
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
                  : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700 hover:text-white'
              }`}
            >
              {b}
            </button>
          ))}
        </div>
      </div>

      {/* Search Input Box */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-500">
          <Search className="w-4 h-4" />
        </div>
        <input
          id="phone-search-input"
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Type model name (e.g. Galaxy A05s, iPhone 13, Redmi Note 12)..."
          className="w-full pl-10 pr-10 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-sm text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-mono"
        />
        {searchQuery && (
          <button
            onClick={() => onSearchChange('')}
            className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-neutral-500 hover:text-neutral-300"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Model Selection Quick Pills */}
      <div className="mt-3 flex items-center gap-2 overflow-x-auto pb-1 text-xs scrollbar-thin">
        <span className="text-neutral-500 shrink-0 font-mono text-[11px]">Quick select:</span>
        {filteredModels.slice(0, 7).map(m => {
          const isSelected = selectedModel?.id === m.id;
          return (
            <button
              key={m.id}
              id={`quick-select-${m.id}`}
              onClick={() => onSelectModel(m)}
              className={`px-2.5 py-1 rounded-md text-xs whitespace-nowrap transition-all border cursor-pointer ${
                isSelected
                  ? 'bg-blue-600/20 border-blue-500 text-blue-300 font-semibold'
                  : 'bg-neutral-800/80 border-neutral-700/60 text-neutral-300 hover:bg-neutral-800 hover:text-white'
              }`}
            >
              {m.name}
            </button>
          );
        })}
      </div>
    </div>
  );
};
