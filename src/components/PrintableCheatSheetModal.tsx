import React, { useState } from 'react';
import { Printer, X, Download, ShieldCheck, Smartphone, Check, FileSpreadsheet } from 'lucide-react';
import { PhoneModel, CompatibilityPair, AccessoryCategory } from '../types';

interface PrintableCheatSheetModalProps {
  isOpen: boolean;
  onClose: () => void;
  phoneModels: PhoneModel[];
  compatibilityPairs: CompatibilityPair[];
}

export const PrintableCheatSheetModal: React.FC<PrintableCheatSheetModalProps> = ({
  isOpen,
  onClose,
  phoneModels,
  compatibilityPairs
}) => {
  const [filterBrand, setFilterBrand] = useState('All');
  const [filterCategory, setFilterCategory] = useState<AccessoryCategory>('all_accessories');

  if (!isOpen) return null;

  const brands = ['All', 'Samsung', 'Apple', 'Xiaomi', 'Motorola', 'Google'];

  const getModel = (id: string) => phoneModels.find(m => m.id === id);

  // Filter compatibility pairs
  const filteredPairs = compatibilityPairs.filter(pair => {
    const source = getModel(pair.sourceModelId);
    const target = getModel(pair.targetModelId);
    if (!source || !target) return false;

    const matchesBrand = filterBrand === 'All' || source.brand === filterBrand || target.brand === filterBrand;
    const matchesCategory = filterCategory === 'all_accessories' || pair.category === 'all_accessories' || pair.category === filterCategory;

    return matchesBrand && matchesCategory;
  });

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    const headers = ['Primary Model', 'Brand', 'Compatible Alternative', 'Category', 'Confidence Level', 'Score (%)', 'Physical Notes', 'Verified By'];
    const rows = filteredPairs.map(p => {
      const source = getModel(p.sourceModelId);
      const target = getModel(p.targetModelId);
      return [
        `"${source?.fullName || p.sourceModelId}"`,
        `"${source?.brand || ''}"`,
        `"${target?.fullName || p.targetModelId}"`,
        `"${p.category}"`,
        `"${p.confidenceLevel}"`,
        `"${p.confidenceScore}"`,
        `"${(p.fitNotes || '').replace(/"/g, '""')}"`,
        `"${p.verifiedBy || 'System Inferred'}"`
      ];
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `CaseScreenChecker_CheatSheet_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-neutral-900 border border-neutral-800 rounded-3xl max-w-5xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800 bg-neutral-950/70 print:hidden">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-neutral-100 flex items-center gap-2">
                Retail Counter Quick-Reference Cheat Sheet
              </h3>
              <p className="text-xs text-neutral-400">
                Print-ready laminated matrix of interchangeable screen protectors and cases
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800 transition-colors cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter Controls (Hidden in Print) */}
        <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-3 bg-neutral-950 border-b border-neutral-800 print:hidden text-xs">
          {/* Brand Filter */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-neutral-400 font-mono">Brand:</span>
            {brands.map(b => (
              <button
                key={b}
                onClick={() => setFilterBrand(b)}
                className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                  filterBrand === b ? 'bg-blue-600 text-white font-semibold' : 'bg-neutral-900 text-neutral-400 hover:text-white'
                }`}
              >
                {b}
              </button>
            ))}
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-neutral-400 font-mono">Category:</span>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value as AccessoryCategory)}
              className="bg-neutral-900 border border-neutral-800 text-neutral-200 rounded-lg px-2.5 py-1 text-xs font-mono"
            >
              <option value="all_accessories">All Categories</option>
              <option value="screen_protector">Screen Protectors Only</option>
              <option value="phone_case">Phone Cases Only</option>
            </select>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCSV}
              className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded-xl font-medium flex items-center gap-1.5 cursor-pointer border border-neutral-700"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              Export CSV
            </button>
            <button
              onClick={handlePrint}
              className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-semibold flex items-center gap-1.5 cursor-pointer shadow-md"
            >
              <Printer className="w-3.5 h-3.5" />
              Print Cheat Sheet
            </button>
          </div>
        </div>

        {/* Print Document Body */}
        <div className="flex-1 overflow-y-auto p-6 bg-neutral-950 print:bg-white print:text-black print:p-0">
          <div className="max-w-4xl mx-auto space-y-4">
            {/* Header section in print document */}
            <div className="border-b border-neutral-800 print:border-black pb-3">
              <h2 className="text-lg font-bold text-neutral-100 print:text-black font-mono">
                CaseScreenChecker • Accessory Cross-Model Reference Table
              </h2>
              <div className="flex items-center justify-between text-xs text-neutral-400 print:text-neutral-600 font-mono mt-1">
                <span>Filter: {filterBrand} | {filterCategory.replace('_', ' ').toUpperCase()}</span>
                <span>Date: {new Date().toISOString().split('T')[0]} • Total Pairs: {filteredPairs.length}</span>
              </div>
            </div>

            {/* Matrix Table */}
            <div className="overflow-x-auto rounded-xl border border-neutral-800 print:border-black">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-neutral-900 print:bg-neutral-200 text-neutral-300 print:text-black border-b border-neutral-800 print:border-black">
                  <tr>
                    <th className="py-2.5 px-3 font-bold">Target Customer Model</th>
                    <th className="py-2.5 px-3 font-bold">Compatible Alternative (Donor)</th>
                    <th className="py-2.5 px-3 font-bold">Category</th>
                    <th className="py-2.5 px-3 font-bold">Confidence</th>
                    <th className="py-2.5 px-3 font-bold">Store Tech Notes</th>
                    <th className="py-2.5 px-3 font-bold">Verified</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800/80 print:divide-black">
                  {filteredPairs.map((pair, index) => {
                    const source = getModel(pair.sourceModelId);
                    const target = getModel(pair.targetModelId);

                    return (
                      <tr key={pair.id || index} className="hover:bg-neutral-900/40 print:hover:bg-transparent">
                        <td className="py-2.5 px-3 font-semibold text-neutral-100 print:text-black">
                          {source?.fullName || pair.sourceModelId}
                        </td>
                        <td className="py-2.5 px-3 font-semibold text-emerald-400 print:text-blue-900">
                          {target?.fullName || pair.targetModelId}
                        </td>
                        <td className="py-2.5 px-3 uppercase text-[11px] text-neutral-400 print:text-neutral-700">
                          {pair.category.replace('_', ' ')}
                        </td>
                        <td className="py-2.5 px-3">
                          <span className="font-bold text-[11px] text-blue-400 print:text-black">
                            {pair.confidenceScore}% ({pair.confidenceLevel.replace(/_/g, ' ')})
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-[11px] text-neutral-300 print:text-black max-w-xs">
                          {pair.fitNotes}
                          {pair.caveats && (
                            <span className="block text-amber-400 print:text-red-700 font-medium mt-0.5">
                              ⚠️ {pair.caveats}
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          {pair.isVerifiedByStaff ? (
                            <span className="inline-block px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 print:bg-transparent print:text-black font-bold">
                              ✓ {pair.verifiedBy ? pair.verifiedBy.split(' ')[0] : 'Yes'}
                            </span>
                          ) : (
                            <span className="text-neutral-500 print:text-neutral-600 text-[10px]">Inferred</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Footer Notes for Print */}
            <div className="pt-2 text-[10px] text-neutral-500 print:text-neutral-700 font-mono flex items-center justify-between">
              <span>CaseScreenChecker Retail Knowledge Base • Strict Physical Tolerance Engine</span>
              <span>Laminated Counter Edition</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
