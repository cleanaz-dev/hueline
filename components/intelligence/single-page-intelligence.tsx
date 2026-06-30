'use client';

import { useState, useEffect } from 'react';
import { Plus, Save, PaintRoller, Zap, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import { PRICING_UNITS } from './constants';
import { IntelligenceConfig, PricingRule } from './types';
import { useOwner } from '@/context/owner-context';


// ============================================================================
// MAIN PAGE COMPONENT
// ============================================================================
export function SinglePageIntelligence({ intelligence }: { intelligence?: any }) {
  const [isSaving, setIsSaving] = useState(false);
  const [config, setConfig] = useState<IntelligenceConfig>({ pricingRules: [] });
  const { handleSaveIntelligence, isSavingIntelligence } = useOwner()

  useEffect(() => {
    // Check for the new relational array
    if (intelligence?.pricingRules) {
      setConfig({ 
        pricingRules: intelligence.pricingRules.map((rule: PricingRule) => ({
          ...rule,
          unitName: rule.unitName || 'qty',
          multiplier: rule.multiplier || 1.0,
          multiplierTarget: rule.multiplierTarget || 'TOTAL'
        })) 
      });
    } else {
      // Dummy data if empty
      setConfig({
        pricingRules: [
          { id: '1', name: 'Base Call-out Fee', chargeType: 'FLAT', unitName: 'qty', amount: 150, isMultiplier: false, multiplier: 1.0, multiplierTarget: 'TOTAL' },
          { id: '2', name: 'Standard Labor', chargeType: 'PER_UNIT', unitName: 'hour', amount: 45, isMultiplier: false, multiplier: 1.0, multiplierTarget: 'TOTAL' },
          { id: '3', name: 'High Ceilings', chargeType: 'FLAT', unitName: 'qty', amount: 0, isMultiplier: true, multiplier: 1.25, multiplierTarget: 'LABOR' },
        ]
      });
    }
  }, [intelligence]);

const handleSave = async () => {
  if (!intelligence?.id) return;
  await handleSaveIntelligence(intelligence.id, config);
};

  const updateRule = (id: string, updates: Partial<PricingRule>) => {
    setConfig((prev) => ({
      ...prev,
      pricingRules: prev.pricingRules.map((rule) => (rule.id === id ? { ...rule, ...updates } : rule)),
    }));
  };

  const removeRule = (id: string) => {
    setConfig((prev) => ({
      ...prev,
      pricingRules: prev.pricingRules.filter((rule) => rule.id !== id),
    }));
  };

  const addRule = (asMultiplier = false) => {
    const newRule: PricingRule = {
      id: crypto.randomUUID(), // Temp ID for React rendering
      name: '',
      amount: 0,
      chargeType: 'FLAT',
      unitName: 'qty',
      isMultiplier: asMultiplier,
      multiplier: 1.0,
      multiplierTarget: 'TOTAL'
    };
    setConfig((prev) => ({ ...prev, pricingRules: [...prev.pricingRules, newRule] }));
  };

  const toggleMultiplier = (id: string, currentState: boolean) => {
    setConfig((prev) => ({
      ...prev,
      pricingRules: prev.pricingRules.map((rule) =>
        rule.id === id ? { 
          ...rule, 
          isMultiplier: !currentState,
          multiplier: rule.multiplier || 1.0,
          multiplierTarget: rule.multiplierTarget || 'TOTAL' 
        } : rule
      ),
    }));
  };

  const standardRules = config.pricingRules.filter((rule) => !rule.isMultiplier);
  const multiplierRules = config.pricingRules.filter((rule) => rule.isMultiplier);

  return (
    <div className="flex flex-col w-full h-[85vh] bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xl">
      
      {/* HEADER */}
      <div className="flex-none bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between z-10 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-slate-900 rounded-lg flex items-center justify-center shadow-sm">
            <PaintRoller className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900 leading-tight">Price Intelligence</h1>
            <p className="text-sm text-slate-500">Train your Voice AI with specific pricing rules.</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="ghost" className="text-slate-500">Discard</Button>
          <Button onClick={handleSave} disabled={isSavingIntelligence} className="gap-2 bg-slate-900 text-white">
            <Save className="w-4 h-4" />
            {isSavingIntelligence ? 'Saving...' : 'Save Rules'}
          </Button>
        </div>
      </div>

      {/* SPLIT SCREEN BODY */}
      <div className="flex flex-1 overflow-hidden">
        
        {/* LEFT COLUMN: MASTER LIST + MULTIPLIER BANK */}
        <div className="w-[55%] flex flex-col border-r border-slate-200 bg-slate-50/50">
          <div className="flex-none p-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <h2 className="font-semibold text-slate-900">Standard Rules</h2>
              <Badge variant="secondary" className="bg-slate-200/60">{config.pricingRules.length}</Badge>
            </div>
            <Button onClick={() => addRule(false)} variant="outline" size="sm" className="h-8 gap-1.5 bg-white">
              <Plus className="w-3.5 h-3.5" /> Add Rule
            </Button>
          </div>
          
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-6 pb-8">
              
              {/* SECTION 1: STANDARD RULES */}
              <div className="space-y-2">
                {standardRules.length === 0 ? (
                  <div className="text-center py-8 border-2 border-dashed border-slate-200 rounded-xl bg-white">
                    <p className="text-sm text-slate-500">No standard pricing rules</p>
                  </div>
                ) : (
                  standardRules.map((rule) => (
                    <PricingRuleRow 
                      key={rule.id} 
                      rule={rule} 
                      onUpdate={(updates) => updateRule(rule.id, updates)} 
                      onRemove={() => removeRule(rule.id)}
                      onToggleMultiplier={() => toggleMultiplier(rule.id, rule.isMultiplier)}
                    />
                  ))
                )}
              </div>

              {/* SECTION 2: MULTIPLIER BANK */}
              {multiplierRules.length > 0 && (
                <div className="mt-8">
                  <div className="flex items-center gap-2 mb-3 px-1">
                    <div className="h-px bg-slate-200 flex-1" />
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Multiplier Bank</span>
                    <div className="h-px bg-slate-200 flex-1" />
                  </div>
                  
                  <div className="space-y-2">
                    {multiplierRules.map((rule) => (
                      <CompactMultiplierBankRow 
                        key={rule.id} 
                        rule={rule} 
                        onUpdate={(updates) => updateRule(rule.id, updates)} 
                        onRemove={() => removeRule(rule.id)}
                        onToggleMultiplier={() => toggleMultiplier(rule.id, rule.isMultiplier)}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>

        {/* RIGHT COLUMN: AI MULTIPLIER DETAILS */}
        <div className="w-[45%] flex flex-col bg-amber-50/20">
          <div className="flex-none p-4 border-b border-amber-100 bg-amber-50 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-500" />
              <h2 className="font-semibold text-amber-900">AI Multipliers</h2>
              <Badge variant="secondary" className="bg-amber-200/50 text-amber-800">{multiplierRules.length}</Badge>
            </div>
            <Button onClick={() => addRule(true)} variant="outline" size="sm" className="h-8 gap-1.5 bg-white border-amber-200 text-amber-700 hover:bg-amber-100">
              <Plus className="w-3.5 h-3.5" /> Add Multiplier
            </Button>
          </div>
          
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-3 pb-8">
              {multiplierRules.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed border-amber-200 rounded-xl bg-amber-50/50">
                  <p className="text-sm text-amber-700/70 mb-3">No multipliers configured.</p>
                  <p className="text-xs text-amber-600/60 max-w-[250px] mx-auto">
                    Toggle a rule from the left to configure how it multiplies the final quote.
                  </p>
                </div>
              ) : (
                multiplierRules.map((rule) => (
                  <MultiplierDetailsRow 
                    key={rule.id} 
                    rule={rule} 
                    onUpdate={(updates) => updateRule(rule.id, updates)}
                  />
                ))
              )}
            </div>
          </ScrollArea>
        </div>

      </div>
    </div>
  );
}

// ============================================================================
// STANDARD ROW (Slim & Horizontal)
// ============================================================================
function PricingRuleRow({ 
  rule, 
  onUpdate, 
  onRemove, 
  onToggleMultiplier 
}: { 
  rule: PricingRule; 
  onUpdate: (u: Partial<PricingRule>) => void; 
  onRemove: () => void;
  onToggleMultiplier: () => void;
}) {
  const isPerUnit = rule.chargeType === 'PER_UNIT';

  return (
    <div className="group flex items-center gap-3 border border-slate-200 bg-white rounded-lg p-2 shadow-sm hover:border-slate-300 transition-all overflow-hidden">
      
      {/* Name */}
      <Input
        value={rule.name}
        onChange={(e) => onUpdate({ name: e.target.value })}
        placeholder="Rule Name"
        className="flex-1 h-8 bg-transparent border-transparent hover:border-slate-200 focus-visible:bg-white text-sm font-medium shadow-none px-2 min-w-[120px]"
      />

      {/* Inline Type */}
      <div className="flex items-center gap-1.5 shrink-0">
        <Label className="text-[9px] uppercase font-bold text-slate-400">Type</Label>
        <Select value={rule.chargeType || 'FLAT'} onValueChange={(val: any) => onUpdate({ chargeType: val })}>
          <SelectTrigger className="h-8 w-[100px] bg-slate-50 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="FLAT">Flat Fee</SelectItem>
            <SelectItem value="PER_UNIT">Per Unit</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Inline Unit (ANIMATED SLIDE) */}
      <div 
        className={`transition-all duration-300 ease-in-out overflow-hidden flex items-center shrink-0 ${
          isPerUnit 
            ? 'max-w-[150px] opacity-100' 
            : 'max-w-0 opacity-0 -ml-3' // -ml-3 perfectly cancels out the parent's gap-3 when hidden
        }`}
      >
        {/* Inner container with a fixed min-width so the Select doesn't squish visually while animating */}
        <div className="flex items-center gap-1.5 min-w-[120px]">
          <Label className="text-[9px] uppercase font-bold text-slate-400">Unit</Label>
          <Select 
            value={rule.unitName || 'qty'} 
            onValueChange={(val) => onUpdate({ unitName: val })}
            disabled={!isPerUnit} // Kept disabled for screen reader accessibility when visually hidden
          >
            <SelectTrigger className="h-8 w-[85px] bg-slate-50 text-xs">
              <SelectValue placeholder="Unit" />
            </SelectTrigger>
            <SelectContent>
              {PRICING_UNITS.map((unit) => (
                <SelectItem key={unit.value} value={unit.value}>{unit.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Inline Rate */}
      <div className="flex items-center gap-1.5 shrink-0">
        <Label className="text-[9px] uppercase font-bold text-slate-400">Rate</Label>
        <div className="relative">
          <span className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 text-xs">$</span>
          <Input
            type="number"
            value={Number.isNaN(rule.amount) ? '' : rule.amount}
            onChange={(e) => onUpdate({ amount: parseFloat(e.target.value) })}
            onBlur={(e) => {
              if (!e.target.value || Number.isNaN(parseFloat(e.target.value))) {
                onUpdate({ amount: 0 }); 
              }
            }}
            className="h-8 w-[80px] pl-5 bg-slate-50 text-xs font-medium"
            placeholder="0"
          />
        </div>
      </div>

      <div className="w-px h-6 bg-slate-200 mx-1 shrink-0" />

      {/* Inline Toggle */}
      <div className="flex items-center gap-1.5 shrink-0 pr-1">
        <Label className="text-[9px] uppercase font-bold text-slate-400 cursor-pointer" onClick={onToggleMultiplier}>Multiplier</Label>
        <Switch 
          checked={rule.isMultiplier}
          onCheckedChange={onToggleMultiplier}
          className="scale-75 data-[state=checked]:bg-amber-500 m-0"
        />
      </div>

      {/* Delete */}
      <Button variant="ghost" size="icon" onClick={onRemove} className="h-8 w-8 shrink-0 text-slate-300 hover:text-red-600 hover:bg-red-50">
        <Trash2 className="w-3.5 h-3.5" />
      </Button>
    </div>
  );
}
// ============================================================================
// COMPACT MULTIPLIER BANK ROW
// ============================================================================
function CompactMultiplierBankRow({ 
  rule, 
  onUpdate, 
  onRemove, 
  onToggleMultiplier 
}: { 
  rule: PricingRule; 
  onUpdate: (u: Partial<PricingRule>) => void; 
  onRemove: () => void;
  onToggleMultiplier: () => void;
}) {
  return (
    <div className="flex items-center gap-3 border border-amber-200 bg-amber-50/60 rounded-lg p-2 shadow-sm animate-in slide-in-from-top-2 fade-in duration-200">
      
      <Input
        value={rule.name}
        onChange={(e) => onUpdate({ name: e.target.value })}
        placeholder="Multiplier Name"
        className="flex-1 h-8 bg-transparent border-transparent hover:border-amber-200/50 focus-visible:bg-white text-sm font-medium text-amber-900 placeholder:text-amber-700/40 shadow-none px-2"
      />

      <div className="w-px h-6 bg-amber-200/50 mx-1 shrink-0" />

      <div className="flex items-center gap-1.5 shrink-0 pr-1">
        <Label className="text-[9px] uppercase font-bold text-amber-600/70 cursor-pointer" onClick={onToggleMultiplier}>Multiplier</Label>
        <Switch 
          checked={rule.isMultiplier}
          onCheckedChange={onToggleMultiplier}
          className="scale-75 data-[state=checked]:bg-amber-500 m-0"
        />
      </div>

      <Button variant="ghost" size="icon" onClick={onRemove} className="h-8 w-8 shrink-0 text-amber-400 hover:text-red-600 hover:bg-red-50">
        <Trash2 className="w-3.5 h-3.5" />
      </Button>
    </div>
  );
}

// ============================================================================
// MULTIPLIER DETAILS ROW
// ============================================================================
function MultiplierDetailsRow({ 
  rule, 
  onUpdate 
}: { 
  rule: PricingRule; 
  onUpdate: (u: Partial<PricingRule>) => void;
}) {
  
  const generatedTrigger = (rule.name || 'UNNAMED_MULTIPLIER')
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '_')
    .replace(/_+/g, '_');

  return (
    <div className="flex items-center gap-3 bg-white border border-amber-200/60 rounded-lg p-2 shadow-sm hover:border-amber-300 transition-all">
      
      {/* Side-by-Side: Name / Auto Trigger */}
      <div className="flex-1 flex flex-col gap-1 px-1 min-w-[120px]">
        <Input
          value={rule.name}
          onChange={(e) => onUpdate({ name: e.target.value })}
          placeholder="e.g., Rush Job"
          className="h-7 border-transparent focus-visible:ring-0 focus-visible:border-amber-200 text-sm font-semibold text-slate-900 bg-transparent px-1 shadow-none"
        />
        <div className="text-[10px] font-mono text-slate-400 px-1 truncate">
          {generatedTrigger}
        </div>
      </div>

      <div className="w-px h-8 bg-slate-100 shrink-0 mx-1" />

      {/* Side-by-Side: Target & Multiplier */}
      <div className="flex items-center gap-3 shrink-0">
        
        <div className="flex flex-col gap-1 w-[120px]">
          <Label className="text-[9px] uppercase font-bold text-slate-400 pl-1">Applies To</Label>
          <Select 
            value={rule.multiplierTarget || 'TOTAL'} 
            onValueChange={(val: any) => onUpdate({ multiplierTarget: val })}
          >
            <SelectTrigger className="h-8 bg-slate-50 text-xs border-slate-200">
              <SelectValue placeholder="Select target..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="TOTAL">Total Quote</SelectItem>
              <SelectItem value="LABOR">Labor Only</SelectItem>
              <SelectItem value="MATERIALS">Materials Only</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-1 w-[80px]">
          <Label className="text-[9px] uppercase font-bold text-amber-600 pl-1">Multiplier</Label>
          <div className="relative">
            <Input
              type="number"
              value={Number.isNaN(rule.multiplier) ? '' : rule.multiplier}
              onChange={(e) => onUpdate({ multiplier: parseFloat(e.target.value) })}
              onBlur={(e) => {
                if (!e.target.value || Number.isNaN(parseFloat(e.target.value))) {
                  onUpdate({ multiplier: 1.0 });
                }
              }}
              step={0.1}
              min={0.1}
              className="h-8 bg-white border-amber-200 focus-visible:ring-amber-500 pr-6 font-semibold text-amber-900 text-xs"
            />
            <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-amber-700 font-bold text-xs pointer-events-none">x</span>
          </div>
        </div>

      </div>
    </div>
  );
}