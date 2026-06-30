"use client";

import { Calculator, Hash, Package, Scale, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { LogicExplainer } from "./logic-explainer";
import { DEFAULT_PRICING_RULES } from "./constants";
import type { PricingRule } from "./types";

function PricingExample({ rules }: { rules: PricingRule[] }) {
  // Find the actual rules by name (or use first match as fallback)
  const baseFee =
    rules.find((r) => r.chargeType === "FLAT" && r.name.toLowerCase().includes("call-out")) ??
    rules.find((r) => r.chargeType === "FLAT");

  const laborRate =
    rules.find(
      (r) => r.chargeType === "PER_UNIT" && r.name.toLowerCase().includes("labor")
    ) ??
    rules.find((r) => r.chargeType === "PER_UNIT");

  const highCeilingMultiplier =
    rules.find(
      (r) => r.isMultiplier && r.name.toLowerCase().includes("ceiling")
    ) ??
    rules.find((r) => r.isMultiplier && r.name.toLowerCase().includes("high"));

  const rushMultiplier =
    rules.find(
      (r) => r.isMultiplier && r.name.toLowerCase().includes("rush")
    ) ??
    rules.find((r) => r.isMultiplier);

  const hours = 4;

  const baseAmount = baseFee?.amount ?? 300;
  const laborRateAmount = laborRate?.amount ?? 65;
  const laborTotal = hours * laborRateAmount;

  const ceilingRate = highCeilingMultiplier?.multiplier ?? 1.25;
  const ceilingAppliesToLabor = highCeilingMultiplier?.multiplierTarget === "LABOR";
  const ceilingSurcharge = ceilingAppliesToLabor
    ? laborTotal * (ceilingRate - 1)
    : (baseAmount + laborTotal) * (ceilingRate - 1);

  const subtotal = baseAmount + laborTotal + ceilingSurcharge;

  const rushRate = rushMultiplier?.multiplier ?? 1.5;
  const rushAppliesToTotal = rushMultiplier?.multiplierTarget === "TOTAL";
  const rushSurcharge = rushAppliesToTotal ? subtotal * (rushRate - 1) : 0;

  const final = subtotal + rushSurcharge;

  return (
    <div className="text-sm">
     
      {/* Step 1: Base & Units */}
      <div className="space-y-1.5 mb-3">
        <div className="flex items-center justify-between text-zinc-600">
          <span>{baseFee?.name ?? "Base Call-out Fee"}:</span>
          <span className="font-mono text-zinc-900">${baseAmount.toFixed(2)}</span>
        </div>
        <div className="flex items-center justify-between text-zinc-600">
          <span>
            {laborRate?.name ?? "Standard Labor"} ({hours} hours @ ${laborRateAmount}):
          </span>
          <span className="font-mono text-zinc-900">${laborTotal.toFixed(2)}</span>
        </div>
      </div>

      {/* Step 2: Specific Multiplier */}
      <div className="space-y-1.5 mb-3 pt-2 border-t border-zinc-100">
        <div className="flex items-center justify-between text-amber-700">
          <span className="flex items-center gap-1.5">
            <ArrowRight className="w-3 h-3" />
            {highCeilingMultiplier?.name ?? "High Ceilings Surcharge"} ({ceilingRate}x on {highCeilingMultiplier?.multiplierTarget ?? "Labor"}):
          </span>
          <span className="font-mono font-medium">${ceilingSurcharge.toFixed(2)}</span>
        </div>
      </div>

      <div className="pt-2 border-t border-zinc-200 font-semibold flex justify-between text-zinc-700">
        <span>Subtotal:</span>
        <span className="font-mono">${subtotal.toFixed(2)}</span>
      </div>

      {/* Step 3: Total Multiplier */}
      <div className="space-y-1.5 mb-3 pt-2">
        <div className="flex items-center justify-between text-amber-700">
          <span className="flex items-center gap-1.5">
            <ArrowRight className="w-3 h-3" />
            {rushMultiplier?.name ?? "Rush Job Surcharge"} ({rushRate}x on {rushMultiplier?.multiplierTarget ?? "Total"}):
          </span>
          <span className="font-mono font-medium">${rushSurcharge.toFixed(2)}</span>
        </div>
      </div>

      {/* Final Output */}
      <div className="pt-3 border-t-2 border-zinc-900 font-bold flex justify-between text-zinc-900 text-base">
        <span>Final AI Estimate:</span>
        <span className="font-mono">${final.toFixed(2)}</span>
      </div>
    </div>
  );
}

export function PricingTab() {
  const rules = DEFAULT_PRICING_RULES;

  const flatFees = rules.filter((r) => !r.isMultiplier && r.chargeType === "FLAT");
  const unitCosts = rules.filter((r) => !r.isMultiplier && r.chargeType === "PER_UNIT");
  const multipliers = rules.filter((r) => r.isMultiplier);

  return (
    <div className="outline-none animate-in fade-in slide-in-from-bottom-1 duration-300">
      <LogicExplainer
        icon={Calculator}
        title="How the AI Calculates"
        description="The AI extracts quantities and context from the user's audio, matches them to your Pricing Rules, and calculates line items. Multipliers are applied sequentially based on their targets (Labor vs Total)."
        exampleTitle="Cost Breakdown"
        exampleContent={<PricingExample rules={rules} />}
      />

      <div className="mt-8 mb-4">
        <h2 className="text-lg font-bold text-zinc-900">Active Pricing Logic</h2>
        <p className="text-sm text-zinc-500">The current rules loaded into your Voice AI.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Flat Fees */}
        <div className="border-zinc-200 shadow-sm overflow-hidden bg-background border rounded-xl">
          <div className="px-4 py-3 bg-zinc-50/80 border-b border-zinc-200 flex items-center gap-2">
            <Hash className="w-4 h-4 text-emerald-500" />
            <h3 className="text-sm font-bold text-zinc-800">Flat Fees</h3>
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
          <div className="px-4 py-3 bg-zinc-50/80 border-b border-zinc-200 flex items-center gap-2">
            <Package className="w-4 h-4 text-blue-500" />
            <h3 className="text-sm font-bold text-zinc-800">Unit Costs</h3>
          </div>
          <div className="divide-y divide-zinc-100">
            {unitCosts.map((item) => (
              <div key={item.id} className="flex justify-between items-center px-4 py-3 hover:bg-zinc-50/50">
                <span className="text-sm font-medium text-zinc-700 truncate">{item.name}</span>
                <span className="text-sm font-mono font-bold text-zinc-900">
                  ${item.amount}{" "}
                  <span className="text-[10px] uppercase font-sans text-zinc-400">
                    / {item.unitName || "qty"}
                  </span>
                </span>
              </div>
            ))}
            {unitCosts.length === 0 && <div className="p-4 text-xs text-zinc-400 italic">No unit costs found.</div>}
          </div>
        </div>

        {/* Multipliers */}
        <div className="border border-amber-200/60 shadow-sm overflow-hidden bg-amber-50/20 rounded-xl">
          <div className="px-4 py-3 bg-amber-50 border-b border-amber-100 flex items-center gap-2">
            <Scale className="w-4 h-4 text-amber-500" />
            <h3 className="text-sm font-bold text-amber-900">AI Multipliers</h3>
          </div>
          <div className="divide-y divide-amber-100/50">
            {multipliers.map((item) => (
              <div key={item.id} className="flex flex-col gap-1.5 px-4 py-3 hover:bg-amber-50/50">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-amber-900 truncate">{item.name}</span>
                  <Badge
                    variant="secondary"
                    className="font-mono text-amber-800 bg-amber-100 border border-amber-200/60 shadow-none"
                  >
                    {item.multiplier}x
                  </Badge>
                </div>
                <div className="text-[10px] uppercase font-bold text-amber-600/70 tracking-wider">
                  Applies to: {item.multiplierTarget}
                </div>
              </div>
            ))}
            {multipliers.length === 0 && <div className="p-4 text-xs text-amber-700/50 italic">No multipliers configured.</div>}
          </div>
        </div>
      </div>
    </div>
  );
}
