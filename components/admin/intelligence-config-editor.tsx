"use client";

import { useState } from "react";
import {
  Calculator,
  LayoutDashboard,
  Braces,
  Flag,
  Plus,
  Trash2,
  DollarSign,
  X,
  Database,
  FileText
} from "lucide-react";

// --- TYPES ---
export interface VariableData {
  value: number;
  type: 'FEE' | 'MULTIPLIER';
  label?: string;
}

export interface IntelligenceConfig {
  prompt: string;
  values: Record<string, VariableData | number>;
  schema: Record<string, string>;
}

interface IntelligenceConfigEditorProps {
  config: IntelligenceConfig | null;
  onUpdateConfig: (newConfig: IntelligenceConfig) => void;
  onRequestAdd: (type: "number" | "boolean") => void;
  onRequestDelete: (key: string, type: "number" | "boolean") => void;
}

// Helper to make "has_wood_rot" look like "Wood Rot"
const formatDisplayName = (name: string) => {
  return name
    .replace(/_/g, " ")
    .replace(/([A-Z])/g, " $1")
    .replace(/\b\w/g, (char) => char.toUpperCase())
    .replace(/Multiplier/g, "")
    .replace(/Fee/g, "")
    .replace(/Is /g, "")
    .replace(/Has /g, "")
    .trim();
};

export function IntelligenceConfigEditor({
  config,
  onUpdateConfig,
  onRequestAdd,
  onRequestDelete,
}: IntelligenceConfigEditorProps) {
  const [activeTab, setActiveTab] = useState<"config" | "logic">("config");

  if (!config) return null;

  // 1. Prepare Pricing Data
  const allEntries = Object.entries(config.values).map(([key, val]) => {
    if (typeof val === 'number') {
       return { key, value: val, type: 'FEE' as const, label: key };
    }
    return { key, ...val };
  });

  const fees = allEntries.filter(v => v.type === 'FEE');
  const multipliers = allEntries.filter(v => v.type === 'MULTIPLIER');

  // 2. Prepare Flags Data (This is just an array of strings now)
  const booleanFlags = Object.keys(config.schema);

  const handleValueChange = (key: string, newValue: string) => {
    const current = config.values[key];
    let updatedEntry;
    if (typeof current === 'number') {
        updatedEntry = parseFloat(newValue);
    } else {
        updatedEntry = { ...current, value: parseFloat(newValue) };
    }
    onUpdateConfig({
      ...config,
      values: { ...config.values, [key]: updatedEntry }
    });
  };

  return (
    <div className="col-span-12 lg:col-span-8 flex flex-col h-full gap-4">
      
      {/* HEADER TABS */}
      <div className="flex items-center justify-between shrink-0">
        <div className="flex items-center gap-1 bg-zinc-100/50 p-1 rounded-lg border border-zinc-200/50">
          <button
            onClick={() => setActiveTab("config")}
            className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-all flex items-center gap-2 ${
              activeTab === "config"
                ? "bg-white text-zinc-900 shadow-sm border border-zinc-200"
                : "text-zinc-500 hover:text-zinc-900"
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5" /> Dashboard
          </button>
          <button
            onClick={() => setActiveTab("logic")}
            className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-all flex items-center gap-2 ${
              activeTab === "logic"
                ? "bg-white text-zinc-900 shadow-sm border border-zinc-200"
                : "text-zinc-500 hover:text-zinc-900"
            }`}
          >
            <Braces className="w-3.5 h-3.5" /> System Logic
          </button>
        </div>
      </div>

      {activeTab === "config" ? (
        <div className="flex-1 flex flex-col gap-4 overflow-hidden h-full">
          
          {/* PRICING ENGINE */}
          <div className="flex-1 basis-1/2 bg-white rounded-xl border border-zinc-200 shadow-sm flex flex-col overflow-hidden">
             <div className="px-5 py-3 border-b border-zinc-100 bg-zinc-50/50 flex justify-between items-center shrink-0">
               <h3 className="font-bold text-sm text-zinc-800 flex items-center gap-2">
                 <Calculator className="w-4 h-4 text-zinc-600" /> Pricing Engine
               </h3>
               <button onClick={() => onRequestAdd("number")} className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900 rounded hover:bg-zinc-800 text-xs font-bold text-white transition-colors shadow-sm">
                 <Plus className="w-3 h-3" /> Add Variable
               </button>
             </div>

             <div className="flex-1 overflow-y-auto">
               <div className="grid grid-cols-1 lg:grid-cols-2 h-full divide-y lg:divide-y-0 lg:divide-x divide-zinc-100 min-h-[200px]">
                 
                 {/* FEES COLUMN */}
                 <div className="p-5 flex flex-col gap-4">
                    <div className="flex items-center gap-2 mb-2">
                       <div className="p-1.5 bg-emerald-100 rounded text-emerald-600"><DollarSign className="w-3.5 h-3.5"/></div>
                       <span className="text-xs font-bold text-zinc-900 uppercase">Flat Fees ($)</span>
                    </div>
                    {fees.map((item) => (
                       <div key={item.key} className="flex justify-between items-center p-2.5 border border-zinc-200 rounded-lg bg-white hover:border-emerald-300 transition-colors group">
                          <span className="text-xs font-medium text-zinc-700 truncate pr-2" title={item.key}>
                            {item.label || formatDisplayName(item.key)}
                          </span>
                          <div className="flex items-center gap-2">
                             <div className="relative">
                               <span className="absolute left-2 top-1.5 text-xs text-zinc-400">$</span>
                               <input 
                                 type="number" 
                                 value={item.value} 
                                 onChange={(e) => handleValueChange(item.key, e.target.value)}
                                 className="w-20 pl-4 pr-1 py-1 text-right font-bold text-sm bg-zinc-50 border border-zinc-200 rounded focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none"
                               />
                             </div>
                             <button onClick={() => onRequestDelete(item.key, "number")} className="opacity-0 group-hover:opacity-100 p-1 text-zinc-300 hover:text-red-500 transition-opacity"><Trash2 className="w-3.5 h-3.5"/></button>
                          </div>
                       </div>
                    ))}
                 </div>

                 {/* MULTIPLIERS COLUMN */}
                 <div className="p-5 flex flex-col gap-4 bg-zinc-50/20">
                    <div className="flex items-center gap-2 mb-2">
                       <div className="p-1.5 bg-indigo-100 rounded text-indigo-600"><X className="w-3.5 h-3.5"/></div>
                       <span className="text-xs font-bold text-zinc-900 uppercase">Multipliers (x)</span>
                    </div>
                    {multipliers.map((item) => (
                       <div key={item.key} className="flex justify-between items-center p-2.5 border border-zinc-200 rounded-lg bg-white hover:border-indigo-300 transition-colors group">
                          <span className="text-xs font-medium text-zinc-700 truncate pr-2" title={item.key}>
                            {item.label || formatDisplayName(item.key)}
                          </span>
                          <div className="flex items-center gap-2">
                             <div className="flex items-center gap-1.5">
                               <p className="text-xs text-zinc-400">x</p>
                               <input 
                                 type="number" 
                                 step="0.01"
                                 value={item.value} 
                                 onChange={(e) => handleValueChange(item.key, e.target.value)}
                                 className="w-20 pl-1 pr-5 py-1 text-right font-bold text-sm bg-zinc-50 border border-zinc-200 rounded focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
                               />
                             </div>
                             <button onClick={() => onRequestDelete(item.key, "number")} className="opacity-0 group-hover:opacity-100 p-1 text-zinc-300 hover:text-red-500 transition-opacity"><Trash2 className="w-3.5 h-3.5"/></button>
                          </div>
                       </div>
                    ))}
                 </div>

               </div>
             </div>
          </div>
          
          {/* FLAGS SECTION - CORRECTED */}
          <div className="flex-1 basis-1/2 bg-white rounded-xl border border-zinc-200 shadow-sm flex flex-col overflow-hidden">
             <div className="px-5 py-3 border-b border-zinc-100 bg-orange-50/20 flex justify-between items-center shrink-0">
               <h3 className="font-bold text-sm text-zinc-800 flex items-center gap-2">
                 <Flag className="w-4 h-4 text-orange-600" /> Context Flags
               </h3>
               <button onClick={() => onRequestAdd("boolean")} className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-zinc-200 rounded hover:bg-zinc-50 text-xs font-bold text-zinc-600 transition-colors shadow-sm">
                 <Plus className="w-3 h-3" /> Add Flag
               </button>
             </div>
             <div className="flex-1 overflow-y-auto p-5">
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                 {/* FIXED MAPPING HERE: Removed [key] brackets */}
                 {booleanFlags.map((key) => (
                   <div key={key} className="group flex items-center justify-between p-3 border border-orange-100 bg-orange-50/10 rounded-lg hover:bg-white hover:border-orange-200 transition-all">
                     <div className="flex items-center gap-3 overflow-hidden">
                       <div className="w-1.5 h-1.5 rounded-full bg-orange-500 shrink-0" />
                       <span className="text-xs font-semibold text-zinc-700 truncate" title={key}>
                         {formatDisplayName(key)}
                       </span>
                     </div>
                     <button onClick={() => onRequestDelete(key, "boolean")} className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-50 text-orange-300 hover:text-red-500 rounded transition-all">
                       <Trash2 className="w-3 h-3" />
                     </button>
                   </div>
                 ))}
                 {booleanFlags.length === 0 && <p className="col-span-full text-center text-xs text-zinc-400 italic">No flags defined.</p>}
               </div>
             </div>
          </div>

        </div>
      ) : (
        /* LOGIC TAB (Keep Full Height) */
        <div className="flex-1 flex flex-col gap-4 overflow-hidden h-full">
          {/* Schema View */}
          <div className="bg-white rounded-xl border border-zinc-200 shadow-sm flex flex-col h-1/3 overflow-hidden">
            <div className="px-5 py-3 border-b border-zinc-100 bg-blue-50/20">
              <h3 className="font-bold text-sm text-zinc-800 flex items-center gap-2">
                <Database className="w-4 h-4 text-blue-600" />
                Data Schema
              </h3>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              <div className="flex flex-wrap gap-2">
                {Object.entries(config.schema).map(([key, type]) => (
                  <span key={key} className="px-2 py-1 bg-zinc-50 border border-zinc-200 rounded text-[10px] font-medium text-zinc-600">
                    {key}: <span className="text-zinc-400">{type}</span>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Prompt Editor */}
          <div className="flex-1 bg-white rounded-xl border border-zinc-200 shadow-sm flex flex-col overflow-hidden">
             <div className="px-5 py-3 border-b border-zinc-100 bg-amber-50/20 flex justify-between items-center">
              <h3 className="font-bold text-sm text-zinc-800 flex items-center gap-2">
                <FileText className="w-4 h-4 text-amber-600" />
                Prompt Logic
              </h3>
            </div>
            <textarea
              value={config.prompt}
              onChange={(e) => onUpdateConfig({ ...config, prompt: e.target.value })}
              className="flex-1 p-5 bg-zinc-50/30 text-xs font-mono text-zinc-700 resize-none outline-none focus:bg-white transition-colors leading-relaxed"
              spellCheck={false}
            />
          </div>
        </div>
      )}
    </div>
  );
}