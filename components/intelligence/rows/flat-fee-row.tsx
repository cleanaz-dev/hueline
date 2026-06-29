import { Trash2 } from 'lucide-react';
import { PricingItem } from '../types';

interface FlatFeeRowProps {
  item: PricingItem;
  onUpdate: (id: string, field: keyof PricingItem, value: any) => void;
  onRemove: (id: string) => void;
}

export function FlatFeeRow({ item, onUpdate, onRemove }: FlatFeeRowProps) {
  return (
    <div className="flex gap-3 items-center group bg-white p-2.5 rounded-xl border border-zinc-200 shadow-sm hover:border-zinc-300 transition-all">
      <input
        value={item.name}
        onChange={(e) => onUpdate(item.id, 'name', e.target.value)}
        placeholder="e.g. Base Call-out"
        className="flex-1 text-sm font-medium p-2 bg-transparent outline-none focus:text-zinc-900"
      />
      <div className="flex items-center gap-1 bg-zinc-50 rounded-lg px-3 border border-zinc-100 focus-within:border-zinc-300 focus-within:bg-white transition-all relative">
        <span className="text-zinc-400 font-medium">$</span>
        <input
          type="number"
          value={item.amount === 0 ? '' : item.amount}
          onChange={(e) => onUpdate(item.id, 'amount', parseFloat(e.target.value) || 0)}
          className="w-24 text-sm font-mono p-2 bg-transparent outline-none"
          placeholder="0.00"
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
