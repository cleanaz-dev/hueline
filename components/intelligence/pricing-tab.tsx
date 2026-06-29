"use client";

import { Calculator, Hash, Package, Scale, Wrench } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { LogicExplainer } from "./logic-explainer";
import { IntelligenceConfig, IntelligenceExample } from "./types";

function PricingExample({ examples }: { examples: IntelligenceExample[] }) {
  const pricingExample = examples.find((e) => e.output?.lineItems?.length);

  // Guard against undefined output (fixes the TS error)
  if (!pricingExample || !pricingExample.output) {
    return (
      <>
        <div className="flex items-center justify-between mb-1">
          <span>3x Premium Paint:</span> <span className="font-mono">$135.00</span>
        </div>
        <div className="flex items-center justify-between mb-1">
          <span>High Ceiling (x1.2):</span> <span className="font-mono">$27.00</span>
        </div>
        <div className="pt-1 mt-1 border-t border-zinc-200 font-bold flex justify-between text-zinc-900">
          <span>Total Estimate:</span> <span>$162.00</span>
        </div>
      </>
    );
  }

  const { lineItems, total } = pricingExample.output;

  return (
    <>
      <p className="italic text-zinc-400 mb-2">"{pricingExample.input}"</p>
      {lineItems.map((item, i) => (
        <div key={i} className="flex items-center justify-between mb-1">
          <span>{item.name}:</span>
          <span className="font-mono">${item.amount.toLocaleString()}</span>
        </div>
      ))}
      <div className="pt-1 mt-1 border-t border-zinc-200 font-bold flex justify-between text-zinc-900">
        <span>Total Estimate:</span>
        <span>${total?.toLocaleString()}</span>
      </div>
    </>
  );
}

// Removed the redundant `examples` prop
export function PricingTab({ config }: { config: IntelligenceConfig }) {
  const flatFees = config.priceBook.filter((i) => i.type === "FLAT_FEE");
  const unitCosts = config.priceBook.filter((i) => i.type === "UNIT_COST");
  const multipliers = config.priceBook.filter((i) => i.type === "MULTIPLIER");
  const equipment = config.priceBook.filter((i) => i.type === "EQUIPMENT");

  return (
    <div className="outline-none animate-in fade-in slide-in-from-bottom-1 duration-300">
      <LogicExplainer
        icon={Calculator}
        title="Pricing Configuration"
        description="These variables control the math behind every quote. The AI pulls items from the Price Book and automatically calculates line items based on quantities discovered in the call."
        exampleTitle="Receipt Generation"
        // Uses config.examples directly
        exampleContent={<PricingExample examples={config.examples} />}
      />

      {/* Updated grid to 4 columns to fit Equipment */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Flat Fees */}
        <div className="border-zinc-200 shadow-sm overflow-hidden bg-background border rounded-xl">
          <div className="px-4 py-3 bg-zinc-50 border-b border-zinc-200 flex items-center gap-2">
            <Hash className="w-4 h-4 text-emerald-500" />
            <h3 className="text-sm font-bold text-zinc-700">Flat Fees</h3>
          </div>
          <div className="divide-y divide-zinc-100">
            {flatFees.map((item) => (
              <div key={item.id} className="flex justify-between items-center px-4 py-3 hover:bg-zinc-50/50">
                <span className="text-sm font-medium text-zinc-700 truncate">{item.name}</span>
                <span className="text-sm font-mono font-bold text-zinc-900">${item.amount.toLocaleString()}</span>
              </div>
            ))}
            {flatFees.length === 0 && <div className="p-4 text-xs text-zinc-400 italic">No flat fees found.</div>}
          </div>
        </div>

        {/* Unit Costs */}
        <div className="border-zinc-200 shadow-sm overflow-hidden bg-background border rounded-xl">
          <div className="px-4 py-3 bg-zinc-50 border-b border-zinc-200 flex items-center gap-2">
            <Package className="w-4 h-4 text-blue-500" />
            <h3 className="text-sm font-bold text-zinc-700">Unit Costs</h3>
          </div>
          <div className="divide-y divide-zinc-100">
            {unitCosts.map((item) => (
              <div key={item.id} className="flex justify-between items-center px-4 py-3 hover:bg-zinc-50/50">
                <span className="text-sm font-medium text-zinc-700 truncate">{item.name}</span>
                <span className="text-sm font-mono font-bold text-zinc-900">${item.amount} <span className="text-xs text-zinc-400 font-sans">/ {item.unit || 'unit'}</span></span>
              </div>
            ))}
            {unitCosts.length === 0 && <div className="p-4 text-xs text-zinc-400 italic">No unit costs found.</div>}
          </div>
        </div>

        {/* Equipment */}
        <div className="border-zinc-200 shadow-sm overflow-hidden bg-background border rounded-xl">
          <div className="px-4 py-3 bg-zinc-50 border-b border-zinc-200 flex items-center gap-2">
            <Wrench className="w-4 h-4 text-orange-500" />
            <h3 className="text-sm font-bold text-zinc-700">Equipment</h3>
          </div>
          <div className="divide-y divide-zinc-100">
            {equipment.map((item) => (
              <div key={item.id} className="flex justify-between items-center px-4 py-3 hover:bg-zinc-50/50">
                <span className="text-sm font-medium text-zinc-700 truncate">{item.name}</span>
                <span className="text-sm font-mono font-bold text-zinc-900">${item.amount.toLocaleString()}</span>
              </div>
            ))}
            {equipment.length === 0 && <div className="p-4 text-xs text-zinc-400 italic">No equipment found.</div>}
          </div>
        </div>

        {/* Multipliers */}
        <div className="border-zinc-200 shadow-sm overflow-hidden bg-background border rounded-xl">
          <div className="px-4 py-3 bg-zinc-50 border-b border-zinc-200 flex items-center gap-2">
            <Scale className="w-4 h-4 text-indigo-500" />
            <h3 className="text-sm font-bold text-zinc-700">Multipliers</h3>
          </div>
          <div className="divide-y divide-zinc-100">
            {multipliers.map((item) => (
              <div key={item.id} className="flex justify-between items-center px-4 py-3 hover:bg-zinc-50/50">
                <span className="text-sm font-medium text-zinc-700 truncate">{item.name}</span>
                <Badge variant="secondary" className="font-mono text-zinc-900 bg-zinc-100">
                  {item.amount}x
                </Badge>
              </div>
            ))}
            {multipliers.length === 0 && <div className="p-4 text-xs text-zinc-400 italic">No multipliers found.</div>}
          </div>
        </div>
      </div>
    </div>
  );
}
