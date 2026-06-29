import { Plus, Trash2, ToggleLeft, ToggleRight } from 'lucide-react';
import { PricingItem } from '../types';

interface PriceBookTabProps {
  items: PricingItem[];
  onAddItem: () => void;
  onUpdateItem: (id: string, updates: Partial<PricingItem>) => void;
  onRemoveItem: (id: string) => void;
  onToggleModifier: (id: string) => void;
}

export function PriceBookTab({
  items,
  onAddItem,
  onUpdateItem,
  onRemoveItem,
  onToggleModifier,
}: PriceBookTabProps) {
  return (
    <div className="space-y-6 max-w-4xl animate-in fade-in duration-300">
      {/* Header */}
      <div className="bg-zinc-50 border border-zinc-200 rounded-2xl p-6 mb-8">
        <h3 className="font-bold text-zinc-900 flex items-center gap-2 mb-2">
          <span className="w-5 h-5 flex items-center justify-center text-zinc-500">📋</span>
          Price Book
        </h3>
        <p className="text-sm text-zinc-600 leading-relaxed">
          All line items that make up your quote. Toggle the modifier switch to make an item conditional
          — those will appear in the Modifiers tab.
        </p>
      </div>

      {/* Add Button */}
      <div className="mb-4">
        <button
          onClick={onAddItem}
          className="flex items-center gap-2 px-5 py-2.5 bg-zinc-900 text-white rounded-xl text-sm font-semibold hover:bg-zinc-800 transition-all shadow-sm active:scale-95"
        >
          <Plus className="w-4 h-4" /> Add Item
        </button>
      </div>

      {/* Items Grid */}
      <div className="space-y-2">
        {items.length === 0 && (
          <div className="text-center p-12 border-2 border-dashed border-zinc-200 rounded-2xl bg-zinc-50">
            <span className="text-3xl block mb-3 opacity-30">📋</span>
            <p className="text-sm font-medium text-zinc-600">No items yet.</p>
            <p className="text-xs text-zinc-400 mt-1">Add your first pricing variable above.</p>
          </div>
        )}

        {items.map((item) => (
          <div
            key={item.id}
            className="grid grid-cols-[1fr_120px_100px_80px_40px] gap-3 items-center p-3 bg-white rounded-xl border border-zinc-200 shadow-sm hover:shadow transition-all"
          >
            {/* Name */}
            <input
              value={item.name}
              onChange={(e) => onUpdateItem(item.id, { name: e.target.value })}
              placeholder="Item name (e.g. Base Labor)"
              className="bg-transparent text-sm font-medium border-b border-zinc-200 pb-1 outline-none focus:border-zinc-900 transition-colors placeholder:text-zinc-400"
            />

            {/* Type */}
            <select
              value={item.type}
              onChange={(e) =>
                onUpdateItem(item.id, { type: e.target.value as PricingItem['type'] })
              }
              className="bg-transparent text-sm border border-zinc-200 rounded-lg px-2 py-2 outline-none focus:ring-2 focus:ring-zinc-500/20 focus:border-zinc-500"
            >
              <option value="FLAT_FEE">+ Flat</option>
              <option value="UNIT_COST">+ /sqft</option>
              <option value="MULTIPLIER">× Multiplier</option>
            </select>

            {/* Amount */}
            <input
              type="number"
              value={item.amount}
              onChange={(e) =>
                onUpdateItem(item.id, { amount: parseFloat(e.target.value) || 0 })
              }
              step={item.type === 'MULTIPLIER' ? 0.1 : 1}
              min={0}
              className="w-full bg-transparent text-sm text-right border-b border-zinc-200 pb-1 outline-none focus:border-zinc-900 transition-colors"
            />

            {/* Unit (only for UNIT_COST) */}
            <div className="text-sm text-zinc-500">
              {item.type === 'UNIT_COST' ? (
                <input
                  value={item.unit || 'sqft'}
                  onChange={(e) => onUpdateItem(item.id, { unit: e.target.value })}
                  className="bg-transparent text-sm w-full border-b border-zinc-200 pb-1 outline-none focus:border-zinc-900"
                />
              ) : (
                <span className="text-zinc-300">—</span>
              )}
            </div>

            {/* Modifier Toggle */}
            <button
              onClick={() => onToggleModifier(item.id)}
              className={`flex items-center justify-center transition-colors ${
                item.isModifier
                  ? 'text-amber-500 hover:text-amber-600'
                  : 'text-zinc-300 hover:text-zinc-500'
              }`}
              title={item.isModifier ? 'Modifier: ON' : 'Modifier: OFF'}
            >
              {item.isModifier ? (
                <ToggleRight className="w-5 h-5" />
              ) : (
                <ToggleLeft className="w-5 h-5" />
              )}
            </button>

            {/* Delete */}
            <button
              onClick={() => onRemoveItem(item.id)}
              className="flex items-center justify-center text-zinc-400 hover:text-red-500 transition-colors"
              title="Delete item"
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

