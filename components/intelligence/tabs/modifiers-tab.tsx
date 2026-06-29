import { Zap, XCircle } from 'lucide-react';
import { PricingItem, PricingCategory } from '../types';

interface ModifiersTabProps {
  items: PricingItem[];                // only items with isModifier === true
  onUpdateItem: (id: string, updates: Partial<PricingItem>) => void;
  onRemoveModifierStatus: (id: string) => void;   // turns off isModifier for the item
}

export function ModifiersTab({ items, onUpdateItem, onRemoveModifierStatus }: ModifiersTabProps) {
  return (
    <div className="space-y-6 max-w-4xl animate-in fade-in duration-300">
      <div className="bg-amber-50 border border-amber-100 rounded-2xl p-6 mb-8">
        <h3 className="font-bold text-amber-900 flex items-center gap-2 mb-2">
          <Zap className="w-5 h-5 text-amber-600" /> Conditional Modifiers
        </h3>
        <p className="text-sm text-amber-700 leading-relaxed">
          Configure what triggers each fee and how it affects the final price. When the AI detects the keyword during a call,
          the associated modifier will be applied automatically.
        </p>
      </div>

      {items.length === 0 ? (
        <div className="text-center p-12 border-2 border-dashed border-zinc-200 rounded-2xl bg-zinc-50">
          <Zap className="w-8 h-8 text-zinc-300 mx-auto mb-3" />
          <p className="text-sm font-medium text-zinc-600">No modifiers configured yet.</p>
          <p className="text-xs text-zinc-400 mt-1">
            Use the <strong className="text-zinc-600">Price Book</strong> tab to mark an item as a modifier, then configure it here.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <div
              key={item.id}
              className="grid grid-cols-[1fr_120px_120px_40px] gap-4 items-center p-4 bg-white rounded-xl border border-zinc-200 shadow-sm hover:shadow transition-all"
            >
              {/* Trigger field */}
              <div className="flex items-center gap-2">
                <span
                  className={`text-xs font-mono px-2 py-0.5 rounded ${
                    item.trigger
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-zinc-100 text-zinc-400'
                  }`}
                >
                  {item.trigger || 'No trigger'}
                </span>
                <input
                  value={item.trigger || ''}
                  onChange={(e) =>
                    onUpdateItem(item.id, {
                      trigger: e.target.value.toUpperCase().replace(/\s+/g, '_'),
                    })
                  }
                  placeholder="e.g. VAULTED_CEILINGS"
                  className="flex-1 bg-transparent text-sm font-mono border-b border-zinc-200 pb-1 outline-none focus:border-amber-500 transition-colors placeholder:text-zinc-400"
                />
              </div>

              {/* Modifier type selector */}
              <select
                value={item.modifierType || item.type || 'FLAT_FEE'}
                onChange={(e) =>
                  onUpdateItem(item.id, { modifierType: e.target.value as PricingCategory })
                }
                className="bg-transparent text-sm border border-zinc-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
              >
                <option value="FLAT_FEE">+ Flat</option>
                <option value="UNIT_COST">+ /sqft</option>
                <option value="MULTIPLIER">× Multiplier</option>
              </select>

              {/* Modifier amount */}
              <input
                type="number"
                value={item.modifierAmount ?? item.amount}
                onChange={(e) =>
                  onUpdateItem(item.id, { modifierAmount: parseFloat(e.target.value) || 0 })
                }
                step={item.modifierType === 'MULTIPLIER' ? 0.1 : 1}
                min={item.modifierType === 'MULTIPLIER' ? 1 : 0}
                className="w-full bg-transparent text-sm text-right border-b border-zinc-200 pb-1 outline-none focus:border-amber-500 transition-colors"
              />

              {/* Remove modifier status */}
              <button
                onClick={() => onRemoveModifierStatus(item.id)}
                className="flex items-center justify-center text-zinc-400 hover:text-red-500 transition-colors"
                title="Convert back to regular price item"
              >
                <XCircle size={18} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

