import { Trash2 } from 'lucide-react';
import { PricingItem } from '../types';

interface UnitCostRowProps {
  item: PricingItem;
  onUpdate: (id: string, field: keyof PricingItem, value: any) => void;
  onRemove: (id: string) => void;
}

export function UnitCostRow({ item, onUpdate, onRemove }: UnitCostRowProps) {
  return (
    <div className="flex gap-3 items-center group bg-white p-2.5 rounded-xl border border-zinc-200 shadow-sm hover:border-zinc-300 transition-all">
      <input
        value={item.name}
        onChange={(e) => onUpdate(item.id, 'name', e.target.value)}
        placeholder="e.g. Standard Paint Cost"
        className="flex-1 text-sm font-medium p-2 bg-transparent outline-none focus:text-zinc-900"
      />
      <div className="flex items-center gap-2 bg-zinc-50 rounded-lg px-2 border border-zinc-100 focus-within:border-zinc-300 focus-within:bg-white transition-all">
        <input
          type="number"
          value={item.amount || ''}
          onChange={(e) => onUpdate(item.id, 'amount', parseFloat(e.target.value) || 0)}
          className="w-20 text-sm font-mono p-2 bg-transparent outline-none text-right"
          placeholder="0"
        />
        <span className="text-zinc-300">/</span>
        <input
          value={item.unit || ''}
          onChange={(e) => onUpdate(item.id, 'unit', e.target.value)}
          placeholder="gallon, sqft"
          className="w-20 text-sm p-2 bg-transparent outline-none text-zinc-500"
        />
      </div>
      <button
        onClick={() => onRemove(item.id)}
        className="p-2 text-zinc-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
}
