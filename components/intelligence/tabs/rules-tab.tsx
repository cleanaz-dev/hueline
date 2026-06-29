import { useState } from 'react';
import { Zap, BrainCircuit } from 'lucide-react';
import { PricingCategory, PricingItem } from '../types';
import { formatFlagName } from '../constants';
import { RuleRow } from '../rows/rule-row';

interface RulesTabProps {
  contextFlags: string[];
  priceBook: PricingItem[];
  onAddRule: (flag: string) => void;
  onRemoveRule: (flag: string) => void;
  onSetImpact: (flag: string, type: PricingCategory | 'NONE') => void;
  onUpdatePriceItem: (id: string, field: keyof PricingItem, value: any) => void;
}

export function RulesTab({
  contextFlags,
  priceBook,
  onAddRule,
  onRemoveRule,
  onSetImpact,
  onUpdatePriceItem,
}: RulesTabProps) {
  const [newFlagInput, setNewFlagInput] = useState('');

  const handleAddRule = (e: React.FormEvent) => {
    e.preventDefault();
    const flag = formatFlagName(newFlagInput);
    if (!flag || contextFlags.includes(flag)) return;
    onAddRule(flag);
    setNewFlagInput('');
  };

  return (
    <div className="space-y-6 max-w-4xl animate-in fade-in duration-300">
      <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-6 mb-8">
        <h3 className="font-bold text-indigo-900 flex items-center gap-2 mb-2">
          <Zap className="w-5 h-5 text-indigo-600" /> Smart Condition Engine
        </h3>
        <p className="text-sm text-indigo-700 leading-relaxed">
          Train the AI on what to listen for during the call. When a condition is triggered, the AI will
          automatically apply the pricing impact to the final quote.
        </p>
      </div>

      <form onSubmit={handleAddRule} className="flex gap-3 mb-8">
        <input
          value={newFlagInput}
          onChange={(e) => setNewFlagInput(e.target.value)}
          placeholder="e.g. PETS_ON_SITE, HIGH_CEILINGS..."
          className="flex-1 text-sm font-mono p-3.5 border border-zinc-200 rounded-xl bg-white shadow-sm outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition-all"
        />
        <button
          type="submit"
          className="px-6 py-3.5 bg-zinc-900 text-white rounded-xl text-sm font-semibold hover:bg-zinc-800 transition-all shadow-md active:scale-95"
        >
          Add Trigger
        </button>
      </form>

      <div className="space-y-3">
        {contextFlags.map((flag) => {
          const linkedItem = priceBook.find((p) => p.name === flag);
          return (
            <RuleRow
              key={flag}
              flag={flag}
              linkedItem={linkedItem}
              onSetImpact={onSetImpact}
              onUpdatePriceItem={onUpdatePriceItem}
              onRemoveRule={onRemoveRule}
            />
          );
        })}

        {contextFlags.length === 0 && (
          <div className="text-center p-12 border-2 border-dashed border-zinc-200 rounded-2xl bg-zinc-50">
            <Zap className="w-8 h-8 text-zinc-300 mx-auto mb-3" />
            <p className="text-sm font-medium text-zinc-600">No AI rules configured yet.</p>
            <p className="text-xs text-zinc-400 mt-1">Add conditions above to train your estimator.</p>
          </div>
        )}
      </div>
    </div>
  );
}

