import { Calculator, Zap } from 'lucide-react';
import { IntelligenceTab } from './types';

interface IntelligenceModalSidebarProps {
  activeTab: IntelligenceTab;
  setActiveTab: (tab: IntelligenceTab) => void;
  allCount: number;         // total items in price book
  modifierCount: number;    // items marked as modifiers
}

export function IntelligenceModalSidebar({
  activeTab,
  setActiveTab,
  allCount,
  modifierCount,
}: IntelligenceModalSidebarProps) {
  return (
    <div className="w-64 border-r border-zinc-200 bg-white p-6 space-y-2 shrink-0">
      {/* Price Book */}
      <button
        onClick={() => setActiveTab('priceBook')}
        className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
          activeTab === 'priceBook'
            ? 'bg-zinc-900 text-white shadow-md'
            : 'text-zinc-600 hover:bg-zinc-100'
        }`}
      >
        <span className="flex items-center gap-3">
          <Calculator className="w-4 h-4" /> Price Book
        </span>
        {allCount > 0 && (
          <span
            className={`text-xs font-medium px-2 py-0.5 rounded-full ${
              activeTab === 'priceBook'
                ? 'bg-zinc-700 text-zinc-200'
                : 'bg-zinc-200 text-zinc-700'
            }`}
          >
            {allCount}
          </span>
        )}
      </button>

      {/* Modifiers */}
      <button
        onClick={() => setActiveTab('modifiers')}
        className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
          activeTab === 'modifiers'
            ? 'bg-amber-500 text-white shadow-md'
            : 'text-zinc-600 hover:bg-amber-50 hover:text-amber-700'
        }`}
      >
        <span className="flex items-center gap-3">
          <Zap className="w-4 h-4" /> Modifiers
        </span>
        {modifierCount > 0 && (
          <span
            className={`text-xs font-medium px-2 py-0.5 rounded-full ${
              activeTab === 'modifiers'
                ? 'bg-amber-300 text-amber-900'
                : 'bg-amber-100 text-amber-700'
            }`}
          >
            {modifierCount}
          </span>
        )}
      </button>
    </div>
  );
}
