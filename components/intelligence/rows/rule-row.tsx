import { BrainCircuit, Trash2 } from 'lucide-react';
import { PricingCategory, PricingItem } from '../types';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';

interface RuleRowProps {
  flag: string;
  linkedItem: PricingItem | undefined;
  onSetImpact: (flag: string, type: PricingCategory | 'NONE') => void;
  onUpdatePriceItem: (id: string, field: keyof PricingItem, value: any) => void;
  onRemoveRule: (flag: string) => void;
}

export function RuleRow({
  flag,
  linkedItem,
  onSetImpact,
  onUpdatePriceItem,
  onRemoveRule,
}: RuleRowProps) {
  const impactType = linkedItem ? linkedItem.type : 'NONE';

  return (
    <div className="relative flex flex-col sm:flex-row sm:items-center gap-4 p-4 pr-12 bg-white border border-zinc-200 rounded-xl shadow-sm hover:border-indigo-200 hover:shadow-md transition-all group">

      {/* Wrapper to connect the two panels cleanly on desktop */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-0 sm:flex-1">

        {/* Left Panel: AI Listens For */}
        <div className="flex items-center gap-3 bg-zinc-100 p-3 rounded-lg sm:rounded-r-none   w-full sm:w-auto shrink-0">
          <BrainCircuit className="w-5 h-5 text-zinc-500 shrink-0" />
          <div className="min-w-0 w-48">
            <p className="text-xs text-zinc-500 font-medium mb-0.5 uppercase tracking-wider">
              AI Listens For
            </p>
            <p className="text-sm font-mono font-bold text-zinc-800 truncate">
              {flag}
            </p>
          </div>
        </div>

        {/* Right Panel: Pricing Impact */}
        <div className="flex items-center gap-3 bg-zinc-50 p-3 rounded-lg sm:rounded-l-none border border-zinc-100 sm:border-l-0 flex-1">
          <span className="text-xs font-semibold text-zinc-500 mr-2 shrink-0">
            Pricing Impact:
          </span>

          <Select
            value={impactType}
            onValueChange={(value) => onSetImpact(flag, value as PricingCategory | 'NONE')}
          >
            <SelectTrigger className="w-[180px] h-9 text-sm font-medium bg-white border border-zinc-200 rounded-md focus:ring-indigo-500">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="NONE">None (Just Tag)</SelectItem>
              <SelectItem value="MULTIPLIER">Multiplier (x)</SelectItem>
              <SelectItem value="FLAT_FEE">Flat Fee ($)</SelectItem>
            </SelectContent>
          </Select>

          {linkedItem && (
            <div className="relative flex items-center">
              <span className="absolute left-2.5 text-zinc-400 text-sm font-medium">
                {linkedItem.type === 'FLAT_FEE' ? '$' : 'x'}
              </span>
              <Input
                type="number"
                step={linkedItem.type === 'MULTIPLIER' ? '0.1' : '1'}
                value={linkedItem.amount || ''}
                onChange={(e) =>
                  onUpdatePriceItem(linkedItem.id, 'amount', parseFloat(e.target.value) || 0)
                }
                className="w-24 text-sm font-mono p-2 pl-6 bg-white border border-zinc-200 rounded-md outline-none focus:border-indigo-500"
              />
            </div>
          )}
        </div>
      </div>

      <button
        onClick={() => onRemoveRule(flag)}
        className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 text-zinc-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
}