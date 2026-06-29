import { Calculator, BrainCircuit } from 'lucide-react';
import { IntelligenceTab } from './types';

interface IntelligenceModalSidebarProps {
  activeTab: IntelligenceTab;
  setActiveTab: (tab: IntelligenceTab) => void;
}

export function IntelligenceModalSidebar({ activeTab, setActiveTab }: IntelligenceModalSidebarProps) {
  return (
    <div className="w-64 border-r border-zinc-200 bg-white p-6 space-y-2 shrink-0">
      <button
        onClick={() => setActiveTab('priceBook')}
        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
          activeTab === 'priceBook'
            ? 'bg-zinc-900 text-white shadow-md'
            : 'text-zinc-600 hover:bg-zinc-100'
        }`}
      >
        <Calculator className="w-4 h-4" /> Core Variables
      </button>
      <button
        onClick={() => setActiveTab('rules')}
        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
          activeTab === 'rules'
            ? 'bg-indigo-600 text-white shadow-md'
            : 'text-zinc-600 hover:bg-indigo-50 hover:text-indigo-600'
        }`}
      >
        <BrainCircuit className="w-4 h-4" /> AI Condition Rules
      </button>
    </div>
  );
}
