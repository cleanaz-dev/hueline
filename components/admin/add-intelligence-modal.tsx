"use client";

import { useState, useEffect } from "react";
import { X, DollarSign, Calculator } from "lucide-react";

interface AddIntelligenceModalProps {
  isOpen: boolean;
  onClose: () => void;
  // Updated signature to accept metaType
  onConfirm: (name: string, val: any, metaType?: 'FEE' | 'MULTIPLIER') => void;
  title: string;
  type: 'number' | 'boolean';
}

// Simplified: Just cleans the string, no suffixes
const formatKeyName = (name: string) => {
  return name
    .toLowerCase()
    .replace(/\s+/g, '_')
    .replace(/[^a-z0-9_]/g, '');
};

export function AddIntelligenceModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  type 
}: AddIntelligenceModalProps) {
  const [name, setName] = useState("");
  const [val, setVal] = useState<string>("");
  const [mode, setMode] = useState<'FEE' | 'MULTIPLIER'>('FEE');

  // Reset state on open
  useEffect(() => {
    if (isOpen) {
      setName("");
      setVal("");
      setMode('FEE');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;
    
    // 1. Clean the key name (e.g. "Travel Cost" -> "travel_cost")
    const finalKey = formatKeyName(name);
    
    // 2. Prepare the value
    const finalVal = type === 'number' ? (parseFloat(val) || 0) : true; // Default boolean to true on add

    // 3. Determine the Explicit Type
    const metaType = type === 'number' ? mode : undefined; 

    // 4. Pass everything to parent
    onConfirm(finalKey, finalVal, metaType); 
    onClose();
  };

  const generatedKey = formatKeyName(name);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden border border-zinc-200 animate-in fade-in zoom-in-95 duration-200">
        <div className="px-5 py-3 border-b border-zinc-100 flex justify-between items-center bg-zinc-50/50">
          <h3 className="font-bold text-sm text-zinc-900">{title}</h3>
          <button onClick={onClose} className="p-1 hover:bg-zinc-200 rounded-md transition-colors">
            <X className="w-4 h-4 text-zinc-500" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-4">
          
          {/* Variable Name */}
          <div>
            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1.5 block">
              Variable Name
            </label>
            <input 
              autoFocus
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={type === 'number' ? "e.g. Travel" : "e.g. Has Pets"}
              className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 transition-all placeholder:text-zinc-400"
            />
            {name && (
              <p className="text-[10px] text-zinc-400 mt-1.5 font-mono truncate">
                Key: <span className="text-emerald-600">{generatedKey}</span>
              </p>
            )}
          </div>

          {/* Type Selection (Number Only) */}
          {type === 'number' && (
            <div className="flex gap-2">
               <button
                 type="button"
                 onClick={() => setMode('FEE')}
                 className={`flex-1 flex items-center justify-center gap-2 py-1.5 px-3 rounded-md text-xs font-semibold border transition-all ${
                   mode === 'FEE' 
                     ? 'bg-zinc-900 text-white border-zinc-900 shadow-sm' 
                     : 'bg-white text-zinc-600 border-zinc-200 hover:bg-zinc-50'
                 }`}
               >
                 <DollarSign className="w-3 h-3" /> Base Fee
               </button>
               <button
                 type="button"
                 onClick={() => setMode('MULTIPLIER')}
                 className={`flex-1 flex items-center justify-center gap-2 py-1.5 px-3 rounded-md text-xs font-semibold border transition-all ${
                   mode === 'MULTIPLIER' 
                     ? 'bg-zinc-900 text-white border-zinc-900 shadow-sm' 
                     : 'bg-white text-zinc-600 border-zinc-200 hover:bg-zinc-50'
                 }`}
               >
                 <Calculator className="w-3 h-3" /> Multiplier
               </button>
            </div>
          )}

          {/* Value Input */}
          {type === 'number' && (
            <div>
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1.5 block">
                {mode === 'FEE' ? 'Amount' : 'Factor'}
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-zinc-400 text-sm font-medium">
                  {mode === 'FEE' ? '$' : 'x'}
                </span>
                <input 
                  type="number" 
                  step={mode === 'FEE' ? "0.01" : "0.1"}
                  value={val}
                  onChange={(e) => setVal(e.target.value)}
                  placeholder={mode === 'FEE' ? "0.00" : "1.0"}
                  className="w-full pl-7 pr-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 transition-all placeholder:text-zinc-400"
                />
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2 mt-2 pt-2 border-t border-zinc-50">
             <button 
               type="button" 
               onClick={onClose}
               className="px-3 py-1.5 text-xs font-medium text-zinc-600 hover:bg-zinc-100 rounded-lg transition-colors"
             >
               Cancel
             </button>
             <button 
               type="submit"
               disabled={!name}
               className="px-4 py-1.5 text-xs font-bold text-white bg-zinc-900 hover:bg-zinc-800 rounded-lg shadow-sm shadow-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed"
             >
               Save Variable
             </button>
          </div>
        </form>
      </div>
    </div>
  );
}