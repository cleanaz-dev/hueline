import { Plus, Package } from 'lucide-react';
import { PricingItem, PricingCategory } from '../types';
import { UnitCostRow } from '../rows/unit-cost-row';
import { FlatFeeRow } from '../rows/flat-fee-row';

interface PriceBookTabProps {
  unitCosts: PricingItem[];
  flatFees: PricingItem[];
  onAddItem: (type: PricingCategory) => void;
  onUpdateItem: (id: string, field: keyof PricingItem, value: any) => void;
  onRemoveItem: (id: string) => void;
}

export function PriceBookTab({
  unitCosts,
  flatFees,
  onAddItem,
  onUpdateItem,
  onRemoveItem,
}: PriceBookTabProps) {
  return (
    <div className="space-y-10 max-w-3xl animate-in fade-in duration-300">
      <section>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-base flex items-center gap-2 text-zinc-900">
            <Package className="w-4 h-4 text-zinc-500" /> Standard Materials &amp; Unit Costs
          </h3>
          <button
            onClick={() => onAddItem('UNIT_COST')}
            className="text-sm font-semibold text-zinc-700 bg-white border border-zinc-200 px-3 py-1.5 rounded-lg hover:bg-zinc-50 shadow-sm transition-all flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" /> Add Variable
          </button>
        </div>
        <div className="grid gap-3">
          {unitCosts.map((item) => (
            <UnitCostRow key={item.id} item={item} onUpdate={onUpdateItem} onRemove={onRemoveItem} />
          ))}
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-base flex items-center gap-2 text-zinc-900">Standard Flat Fees</h3>
          <button
            onClick={() => onAddItem('FLAT_FEE')}
            className="text-sm font-semibold text-zinc-700 bg-white border border-zinc-200 px-3 py-1.5 rounded-lg hover:bg-zinc-50 shadow-sm transition-all flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" /> Add Fee
          </button>
        </div>
        <div className="grid gap-3">
          {flatFees.map((item) => (
            <FlatFeeRow key={item.id} item={item} onUpdate={onUpdateItem} onRemove={onRemoveItem} />
          ))}
        </div>
      </section>
    </div>
  );
}
