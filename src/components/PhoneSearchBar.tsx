import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { Search, Smartphone, X, ChevronDown } from 'lucide-react';
import { PhoneModel } from '../types';
import { useLanguage } from '../i18n/translations';
import { fuzzySearchModels } from '../utils/modelSearch';

interface PhoneSearchBarProps {
  phoneModels: PhoneModel[];
  selectedModel: PhoneModel | null;
  onSelectModel: (model: PhoneModel) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedBrand: string;
  onBrandChange: (brand: string) => void;
  onOpenAddPair?: () => void;
}

export const PhoneSearchBar: React.FC<PhoneSearchBarProps> = ({
  phoneModels,
  selectedModel,
  onSelectModel,
  searchQuery,
  onSearchChange,
  selectedBrand,
  onBrandChange,
  onOpenAddPair
}) => {
  const { t } = useLanguage();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const brands = ['All', ...new Set(phoneModels.map(m => m.brand).filter(Boolean).sort())];

  // Filtered models using fuzzy search when there's a query
  const filteredModels = useMemo((): PhoneModel[] => {
    if (!searchQuery.trim()) {
      return selectedBrand === 'All'
        ? phoneModels
        : phoneModels.filter(m => m.brand === selectedBrand);
    }
    const ranked = fuzzySearchModels(phoneModels, searchQuery);
    const filtered = selectedBrand !== 'All'
      ? ranked.filter(r => r.model.brand === selectedBrand)
      : ranked;
    return filtered.map(r => r.model);
  }, [phoneModels, searchQuery, selectedBrand]);

  const displayModels = filteredModels.slice(0, 80);

  // Reset highlight when results change
  useEffect(() => {
    setHighlightedIndex(-1);
  }, [searchQuery, selectedBrand]);

  // Click outside to close dropdown
  useEffect(() => {
    if (!isDropdownOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (
        dropdownRef.current && !dropdownRef.current.contains(e.target as Node) &&
        inputRef.current && !inputRef.current.contains(e.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [isDropdownOpen]);

  // Scroll highlighted item into view
  useEffect(() => {
    if (highlightedIndex >= 0 && listRef.current) {
      const item = listRef.current.children[highlightedIndex] as HTMLElement;
      if (item) item.scrollIntoView({ block: 'nearest' });
    }
  }, [highlightedIndex]);

  const selectModel = useCallback((model: PhoneModel) => {
    onSelectModel(model);
    onSearchChange('');
    setIsDropdownOpen(false);
    setHighlightedIndex(-1);
  }, [onSelectModel, onSearchChange]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (!isDropdownOpen) {
        setIsDropdownOpen(true);
        setHighlightedIndex(0);
        return;
      }
      setHighlightedIndex(prev =>
        prev < displayModels.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (!isDropdownOpen) return;
      setHighlightedIndex(prev =>
        prev > 0 ? prev - 1 : displayModels.length - 1
      );
    } else if (e.key === 'Enter' && highlightedIndex >= 0 && displayModels[highlightedIndex]) {
      e.preventDefault();
      selectModel(displayModels[highlightedIndex]);
    } else if (e.key === 'Escape') {
      setIsDropdownOpen(false);
      setHighlightedIndex(-1);
    }
  };

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

        {/* Dynamic Brand Filter Chips */}
        <div className="flex items-center gap-1.5 flex-wrap" role="radiogroup" aria-label={t.filterByBrand}>
          {brands.map(b => (
            <button
              key={b}
              id={`brand-filter-${b.toLowerCase()}`}
              onClick={() => onBrandChange(b)}
              role="radio"
              aria-checked={selectedBrand === b}
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

      {/* Search Input Bar with Combobox */}
      <div className="relative" ref={dropdownRef}>
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-500">
          <Search className="w-4 h-4" />
        </div>
        <input
          id="phone-search-input"
          ref={inputRef}
          type="text"
          role="combobox"
          aria-expanded={isDropdownOpen}
          aria-controls="phone-search-listbox"
          aria-autocomplete="list"
          aria-activedescendant={highlightedIndex >= 0 ? `search-item-${highlightedIndex}` : undefined}
          value={searchQuery}
          onChange={(e) => {
            onSearchChange(e.target.value);
            if (!isDropdownOpen) setIsDropdownOpen(true);
          }}
          onFocus={() => setIsDropdownOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={t.searchPlaceholder}
          className="w-full pl-10 pr-10 py-3 bg-neutral-950 border border-neutral-800 rounded-xl text-neutral-100 placeholder-neutral-500 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-mono transition-all"
        />
        {searchQuery && (
          <button
            onClick={() => {
              onSearchChange('');
              inputRef.current?.focus();
            }}
            className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-neutral-500 hover:text-neutral-300 cursor-pointer"
            aria-label="Clear search"
          >
            <X className="w-4 h-4" />
          </button>
        )}
        {!searchQuery && (
          <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-neutral-500 pointer-events-none">
            <ChevronDown className={`w-4 h-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
          </div>
        )}

        {/* Dropdown List */}
        {isDropdownOpen && (
          <div className="absolute z-50 mt-1 w-full bg-neutral-950 border border-neutral-700 rounded-xl shadow-2xl overflow-hidden">
            {displayModels.length === 0 ? (
              <div className="p-4 text-center text-xs text-neutral-500">
                {t.noMatchesFound}
              </div>
            ) : (
              <ul
                id="phone-search-listbox"
                ref={listRef}
                role="listbox"
                className="max-h-72 overflow-y-auto scrollbar-thin"
              >
                {displayModels.map((model, index) => {
                  const isSelected = selectedModel?.id === model.id;
                  const isHighlighted = index === highlightedIndex;
                  return (
                    <li
                      key={model.id}
                      id={`search-item-${index}`}
                      role="option"
                      aria-selected={isSelected}
                      onClick={() => selectModel(model)}
                      onMouseEnter={() => setHighlightedIndex(index)}
                      className={`flex items-center gap-3 px-4 py-2.5 text-xs cursor-pointer transition-colors ${
                        isHighlighted
                          ? 'bg-blue-600/20 text-white border-l-2 border-blue-500'
                          : isSelected
                            ? 'bg-blue-600/10 text-neutral-100 border-l-2 border-blue-600/50'
                            : 'text-neutral-300 border-l-2 border-transparent hover:bg-neutral-800/60'
                      }`}
                    >
                      <div className="w-8 h-8 rounded-lg bg-neutral-800 flex items-center justify-center font-bold text-xs text-neutral-300 shrink-0 border border-neutral-700 font-mono">
                        {model.brand.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold truncate">{model.fullName}</span>
                          <span className="text-[10px] font-mono text-neutral-500 whitespace-nowrap">
                            {model.releaseYear}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          {model.aliases.slice(0, 3).map(alias => (
                            <span
                              key={alias}
                              className="text-[9px] font-mono bg-neutral-800 text-neutral-400 px-1.5 py-0.5 rounded border border-neutral-700"
                            >
                              {alias}
                            </span>
                          ))}
                          {model.aliases.length > 3 && (
                            <span className="text-[9px] text-neutral-500">+{model.aliases.length - 3}</span>
                          )}
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-[10px] font-mono text-neutral-500 block">
                          {model.dimensions.height}x{model.dimensions.width}mm
                        </span>
                        <span className="text-[9px] text-neutral-600 block">
                          {model.screen.diagonalIn}"
                        </span>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
            {filteredModels.length > 80 && (
              <div className="px-4 py-2 text-center text-[10px] text-neutral-500 border-t border-neutral-800 bg-neutral-950">
                Showing 80 of {filteredModels.length} models. Type more to narrow results.
              </div>
            )}
          </div>
        )}
      </div>

      {/* Selected Model Quick Info */}
      {selectedModel && !searchQuery && !isDropdownOpen && (
        <div className="mt-3 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <span className="text-[11px] text-neutral-500 font-mono shrink-0">{t.foundModels} ({filteredModels.length}):</span>
          {displayModels.slice(0, 15).map(model => (
            <button
              key={model.id}
              id={`model-select-${model.id}`}
              onClick={() => selectModel(model)}
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
      )}
    </div>
  );
};