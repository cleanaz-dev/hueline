"use client";

import { useState, useEffect } from "react";
import {
  X,
  Plus,
  Trash2,
  Package,
  Hammer,
  DollarSign,
  Scale,
  Flag,
  FileText,
  Calculator
} from "lucide-react";

// --- TYPES ---
export type PricingCategory = 'FLAT_FEE' | 'UNIT_COST' | 'EQUIPMENT' | 'MULTIPLIER';

export interface PricingItem {
  id: string;
  name: string;
  amount: number;
  type: PricingCategory;
  unit?: string;
}

export interface IntelligenceConfig {
  prompt: string;
  priceBook: PricingItem[];
  contextFlags: string[];
}

interface IntelligenceModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: IntelligenceConfig | null; // Pass existing intelligence here
  onSave: (data: IntelligenceConfig) => void;
}

const DEFAULT_CONFIG: IntelligenceConfig = {
  prompt: "You are an expert estimator. Listen to the transcript and generate an itemized quote based ONLY on the provided Price Book.",
  priceBook: [],
  contextFlags: [],
};

export function IntelligenceModal({ isOpen, onClose, initialData, onSave }: IntelligenceModalProps) {
  const [activeTab, setActiveTab] = useState<'priceBook' | 'flags' | 'prompt'>('priceBook');
  const [config, setConfig] = useState<IntelligenceConfig>(DEFAULT_CONFIG);
  const [newFlagInput, setNewFlagInput] = useState("");

  const isEditMode = !!initialData; // Check if we are updating or creating

  // Sync initial data when modal opens
  useEffect(() => {
    if (isOpen) {
      setConfig(initialData || DEFAULT_CONFIG);
      setActiveTab('priceBook');
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  // --- HANDLERS: PRICE BOOK ---
  const addPriceItem = (type: PricingCategory) => {
    const newItem: PricingItem = {
      id: crypto.randomUUID(),
      name: "",
      amount: 0,
      type,
      unit: type === "UNIT_COST" ? "sqft" : undefined,
    };
    setConfig({ ...config, priceBook: [...config.priceBook, newItem] });
  };

  const updatePriceItem = (id: string, field: keyof PricingItem, value: any) => {
    setConfig({
      ...config,
      priceBook: config.priceBook.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      ),
    });
  };

  const removePriceItem = (id: string) => {
    setConfig({
      ...config,
      priceBook: config.priceBook.filter((item) => item.id !== id),
    });
  };

  // --- HANDLERS: FLAGS ---
  const addFlag = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFlagInput.trim() || config.contextFlags.includes(newFlagInput.trim())) return;
    setConfig({
      ...config,
      contextFlags: [...config.contextFlags, newFlagInput.trim()],
    });
    setNewFlagInput("");
  };

  const removeFlag = (flagToRemove: string) => {
    setConfig({
      ...config,
      contextFlags: config.contextFlags.filter((f) => f !== flagToRemove),
    });
  };

  // --- FILTERED DATA FOR UI ---
  const unitCosts = config.priceBook.filter((i) => i.type === 'UNIT_COST');
  const flatFees = config.priceBook.filter((i) => i.type === 'FLAT_FEE');
  const equipment = config.priceBook.filter((i) => i.type === 'EQUIPMENT');
  const multipliers = config.priceBook.filter((i) => i.type === 'MULTIPLIER');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-900/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* DYNAMIC HEADER */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 bg-zinc-50/50">
          <div>
            <h2 className="text-lg font-bold text-zinc-900">
              {isEditMode ? "Update Intelligence" : "Create Intelligence"}
            </h2>
            <p className="text-sm text-zinc-500">Configure your pricing logic and AI instructions.</p>
          </div>
          <button onClick={onClose} className="p-2 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* MAIN LAYOUT */}
        <div className="flex flex-1 overflow-hidden">
          {/* SIDEBAR TABS */}
          <div className="w-48 border-r border-zinc-200 bg-zinc-50/30 p-4 space-y-1 shrink-0">
            <button
              onClick={() => setActiveTab('priceBook')}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'priceBook' ? 'bg-white shadow-sm border border-zinc-200 text-zinc-900' : 'text-zinc-600 hover:bg-zinc-100'
              }`}
            >
              <Calculator className="w-4 h-4" /> Price Book
            </button>
            <button
              onClick={() => setActiveTab('flags')}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'flags' ? 'bg-white shadow-sm border border-zinc-200 text-zinc-900' : 'text-zinc-600 hover:bg-zinc-100'
              }`}
            >
              <Flag className="w-4 h-4" /> Context Flags
            </button>
            <button
              onClick={() => setActiveTab('prompt')}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'prompt' ? 'bg-white shadow-sm border border-zinc-200 text-zinc-900' : 'text-zinc-600 hover:bg-zinc-100'
              }`}
            >
              <FileText className="w-4 h-4" /> AI Prompt
            </button>
          </div>

          {/* CONTENT AREA */}
          <div className="flex-1 overflow-y-auto p-6 bg-white">
            
            {/* TAB: PRICE BOOK */}
            {activeTab === 'priceBook' && (
              <div className="space-y-8">
                
                {/* FLAT FEES */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold text-sm flex items-center gap-2 text-zinc-800">
                      <DollarSign className="w-4 h-4 text-emerald-500" /> Flat Fees
                    </h3>
                    <button onClick={() => addPriceItem('FLAT_FEE')} className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1.5 rounded hover:bg-emerald-100 flex items-center gap-1">
                      <Plus className="w-3 h-3"/> Add Fee
                    </button>
                  </div>
                  <div className="space-y-2">
                    {flatFees.map(item => (
                      <div key={item.id} className="flex gap-2 items-center group">
                        <input value={item.name} onChange={(e) => updatePriceItem(item.id, 'name', e.target.value)} placeholder="e.g. Dispatch Fee" className="flex-1 text-sm p-2 border border-zinc-200 rounded bg-zinc-50 outline-none focus:bg-white focus:border-emerald-500 transition-colors" />
                        <div className="relative w-32">
                          <span className="absolute left-3 top-2 text-zinc-400 text-sm">$</span>
                          <input type="number" value={item.amount || ''} onChange={(e) => updatePriceItem(item.id, 'amount', parseFloat(e.target.value) || 0)} className="w-full text-sm p-2 pl-6 border border-zinc-200 rounded bg-zinc-50 outline-none focus:bg-white focus:border-emerald-500 transition-colors" />
                        </div>
                        <button onClick={() => removePriceItem(item.id)} className="p-2 text-zinc-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"><Trash2 className="w-4 h-4"/></button>
                      </div>
                    ))}
                    {flatFees.length === 0 && <p className="text-xs text-zinc-400 italic">No flat fees configured.</p>}
                  </div>
                </div>

                {/* UNIT COSTS */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold text-sm flex items-center gap-2 text-zinc-800">
                      <Package className="w-4 h-4 text-blue-500" /> Unit Costs
                    </h3>
                    <button onClick={() => addPriceItem('UNIT_COST')} className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1.5 rounded hover:bg-blue-100 flex items-center gap-1">
                      <Plus className="w-3 h-3"/> Add Unit Cost
                    </button>
                  </div>
                  <div className="space-y-2">
                    {unitCosts.map(item => (
                      <div key={item.id} className="flex gap-2 items-center group">
                        <input value={item.name} onChange={(e) => updatePriceItem(item.id, 'name', e.target.value)} placeholder="e.g. Premium Paint" className="flex-1 text-sm p-2 border border-zinc-200 rounded bg-zinc-50 outline-none focus:bg-white focus:border-blue-500 transition-colors" />
                        <div className="relative w-28">
                          <span className="absolute left-3 top-2 text-zinc-400 text-sm">$</span>
                          <input type="number" value={item.amount || ''} onChange={(e) => updatePriceItem(item.id, 'amount', parseFloat(e.target.value) || 0)} className="w-full text-sm p-2 pl-6 border border-zinc-200 rounded bg-zinc-50 outline-none focus:bg-white focus:border-blue-500 transition-colors" />
                        </div>
                        <span className="text-xs text-zinc-400 font-medium">per</span>
                        <input value={item.unit || ''} onChange={(e) => updatePriceItem(item.id, 'unit', e.target.value)} placeholder="sqft, hr" className="w-24 text-sm p-2 border border-zinc-200 rounded bg-zinc-50 outline-none focus:bg-white focus:border-blue-500 transition-colors" />
                        <button onClick={() => removePriceItem(item.id)} className="p-2 text-zinc-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"><Trash2 className="w-4 h-4"/></button>
                      </div>
                    ))}
                    {unitCosts.length === 0 && <p className="text-xs text-zinc-400 italic">No unit costs configured.</p>}
                  </div>
                </div>

                {/* EQUIPMENT */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold text-sm flex items-center gap-2 text-zinc-800">
                      <Hammer className="w-4 h-4 text-amber-500" /> Equipment
                    </h3>
                    <button onClick={() => addPriceItem('EQUIPMENT')} className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-1.5 rounded hover:bg-amber-100 flex items-center gap-1">
                      <Plus className="w-3 h-3"/> Add Equipment
                    </button>
                  </div>
                  <div className="space-y-2">
                    {equipment.map(item => (
                      <div key={item.id} className="flex gap-2 items-center group">
                        <input value={item.name} onChange={(e) => updatePriceItem(item.id, 'name', e.target.value)} placeholder="e.g. Scaffolding" className="flex-1 text-sm p-2 border border-zinc-200 rounded bg-zinc-50 outline-none focus:bg-white focus:border-amber-500 transition-colors" />
                        <div className="relative w-32">
                          <span className="absolute left-3 top-2 text-zinc-400 text-sm">$</span>
                          <input type="number" value={item.amount || ''} onChange={(e) => updatePriceItem(item.id, 'amount', parseFloat(e.target.value) || 0)} className="w-full text-sm p-2 pl-6 border border-zinc-200 rounded bg-zinc-50 outline-none focus:bg-white focus:border-amber-500 transition-colors" />
                        </div>
                        <button onClick={() => removePriceItem(item.id)} className="p-2 text-zinc-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"><Trash2 className="w-4 h-4"/></button>
                      </div>
                    ))}
                    {equipment.length === 0 && <p className="text-xs text-zinc-400 italic">No equipment configured.</p>}
                  </div>
                </div>

                {/* MULTIPLIERS */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold text-sm flex items-center gap-2 text-zinc-800">
                      <Scale className="w-4 h-4 text-indigo-500" /> Multipliers
                    </h3>
                    <button onClick={() => addPriceItem('MULTIPLIER')} className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-1.5 rounded hover:bg-indigo-100 flex items-center gap-1">
                      <Plus className="w-3 h-3"/> Add Multiplier
                    </button>
                  </div>
                  <div className="space-y-2">
                    {multipliers.map(item => (
                      <div key={item.id} className="flex gap-2 items-center group">
                        <input value={item.name} onChange={(e) => updatePriceItem(item.id, 'name', e.target.value)} placeholder="e.g. High Ceilings Factor" className="flex-1 text-sm p-2 border border-zinc-200 rounded bg-zinc-50 outline-none focus:bg-white focus:border-indigo-500 transition-colors" />
                        <div className="relative w-32">
                          <span className="absolute left-3 top-2 text-zinc-400 text-sm">x</span>
                          <input type="number" step="0.1" value={item.amount || ''} onChange={(e) => updatePriceItem(item.id, 'amount', parseFloat(e.target.value) || 0)} className="w-full text-sm p-2 pl-7 border border-zinc-200 rounded bg-zinc-50 outline-none focus:bg-white focus:border-indigo-500 transition-colors" />
                        </div>
                        <button onClick={() => removePriceItem(item.id)} className="p-2 text-zinc-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"><Trash2 className="w-4 h-4"/></button>
                      </div>
                    ))}
                    {multipliers.length === 0 && <p className="text-xs text-zinc-400 italic">No multipliers configured.</p>}
                  </div>
                </div>

              </div>
            )}

            {/* TAB: FLAGS */}
            {activeTab === 'flags' && (
              <div className="space-y-6">
                <div>
                  <h3 className="font-bold text-sm text-zinc-800 mb-1">Context Flags</h3>
                  <p className="text-sm text-zinc-500 mb-4">
                    Define true/false signals the AI should listen for during the call (e.g. "Has Pets", "Requires Permit").
                  </p>
                  
                  <form onSubmit={addFlag} className="flex gap-2 mb-6">
                    <input
                      value={newFlagInput}
                      onChange={(e) => setNewFlagInput(e.target.value)}
                      placeholder="Enter a new flag name..."
                      className="flex-1 text-sm p-2 border border-zinc-200 rounded bg-zinc-50 outline-none focus:bg-white focus:border-zinc-900 transition-colors"
                    />
                    <button type="submit" className="px-4 py-2 bg-zinc-900 text-white rounded text-sm font-medium hover:bg-zinc-800 transition-colors">
                      Add
                    </button>
                  </form>

                  <div className="flex flex-wrap gap-2">
                    {config.contextFlags.map((flag) => (
                      <div key={flag} className="flex items-center gap-2 pl-3 pr-1 py-1 bg-zinc-100 border border-zinc-200 rounded-full text-sm text-zinc-700">
                        {flag}
                        <button onClick={() => removeFlag(flag)} className="p-1 hover:bg-zinc-200 rounded-full text-zinc-400 hover:text-red-500 transition-colors">
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                    {config.contextFlags.length === 0 && <p className="text-sm text-zinc-400 w-full italic">No flags created yet.</p>}
                  </div>
                </div>
              </div>
            )}

            {/* TAB: PROMPT */}
            {activeTab === 'prompt' && (
              <div className="space-y-4 h-full flex flex-col">
                <div>
                  <h3 className="font-bold text-sm text-zinc-800 mb-1">System Prompt</h3>
                  <p className="text-sm text-zinc-500">
                    The core instructions given to the AI Estimator. The Price Book and Flags will be automatically injected below this.
                  </p>
                </div>
                <textarea
                  value={config.prompt}
                  onChange={(e) => setConfig({ ...config, prompt: e.target.value })}
                  className="flex-1 w-full p-4 text-sm font-mono text-zinc-700 bg-zinc-50 border border-zinc-200 rounded-lg resize-none outline-none focus:bg-white focus:border-zinc-900 transition-colors"
                  placeholder="Enter system prompt here..."
                />
              </div>
            )}
          </div>
        </div>

        {/* DYNAMIC FOOTER */}
        <div className="p-4 border-t border-zinc-200 bg-zinc-50 flex justify-end gap-3 shrink-0">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-zinc-600 hover:text-zinc-900 transition-colors">
            Cancel
          </button>
          <button onClick={() => onSave(config)} className="px-6 py-2 bg-zinc-900 text-white text-sm font-medium rounded-lg hover:bg-zinc-800 transition-colors shadow-sm">
            {isEditMode ? "Save Changes" : "Create Configuration"}
          </button>
        </div>
      </div>
    </div>
  );
}