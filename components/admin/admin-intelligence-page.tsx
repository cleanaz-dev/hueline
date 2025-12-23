"use client";

import { useState, useEffect } from "react";
import { useSuperAdmin } from "@/context/super-admin-context";
import { SubdomainSelector } from "./subdomain-selector";
import { toast, Toaster } from "sonner";
import { 
  Sparkles, 
  Save, 
  Loader2, 
  Bot, 
  Calculator,
  Database,
  FileText,
  LayoutDashboard,
  ArrowRight,
  Braces,
  Flag,
  ToggleRight,
  Plus,
  Trash2,
  X
} from "lucide-react";

// --- HELPERS ---

const formatDisplayName = (name: string) => {
  return name
    .replace(/_/g, " ")
    .replace(/([A-Z])/g, " $1")
    .replace(/\b\w/g, (char) => char.toUpperCase())
    .trim();
};

const formatKeyName = (name: string) => {
  return name
    .toLowerCase()
    .replace(/\s+/g, '_')
    .replace(/[^a-z0-9_]/g, '');
};

// --- MODAL COMPONENT ---

const AddItemModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  type 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  onConfirm: (name: string, val: any) => void;
  title: string;
  type: 'number' | 'boolean';
}) => {
  const [name, setName] = useState("");
  const [val, setVal] = useState<string>("");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;
    
    // Default values
    const finalVal = type === 'number' ? (parseFloat(val) || 0) : 'boolean'; 
    onConfirm(formatKeyName(name), finalVal);
    setName("");
    setVal("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden border border-zinc-200 animate-in fade-in zoom-in-95 duration-200">
        <div className="px-6 py-4 border-b border-zinc-100 flex justify-between items-center bg-zinc-50/50">
          <h3 className="font-bold text-zinc-900">{title}</h3>
          <button onClick={onClose} className="p-1 hover:bg-zinc-200 rounded-md transition-colors">
            <X className="w-4 h-4 text-zinc-500" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
          <div>
            <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1.5 block">
              Variable Name
            </label>
            <input 
              autoFocus
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={type === 'number' ? "e.g. Travel Fee" : "e.g. Has Pets"}
              className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 transition-all"
            />
            {name && (
              <p className="text-[10px] text-zinc-400 mt-1 font-mono">
                System key: <span className="text-emerald-600">{formatKeyName(name)}</span>
              </p>
            )}
          </div>

          {type === 'number' && (
            <div>
              <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1.5 block">
                Default Value
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-zinc-400 text-sm">$</span>
                <input 
                  type="number" 
                  value={val}
                  onChange={(e) => setVal(e.target.value)}
                  placeholder="0.00"
                  className="w-full pl-6 pr-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 transition-all"
                />
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2 mt-4">
             <button 
               type="button" 
               onClick={onClose}
               className="px-4 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-100 rounded-lg transition-colors"
             >
               Cancel
             </button>
             <button 
               type="submit"
               disabled={!name}
               className="px-4 py-2 text-sm font-bold text-white bg-zinc-900 hover:bg-zinc-800 rounded-lg shadow-md shadow-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed"
             >
               Create Variable
             </button>
          </div>
        </form>
      </div>
    </div>
  );
};


// --- MAIN PAGE ---

export default function AdminIntelligencePage() {
  const { clients } = useSuperAdmin();
  const [selectedSlug, setSelectedSlug] = useState<string>("");
  
  // Data State
  const [businessContext, setBusinessContext] = useState("");
  const [config, setConfig] = useState<{
    prompt: string;
    values: Record<string, number>;
    schema: Record<string, string>;
  } | null>(null);

  // UI State
  const [status, setStatus] = useState<"idle" | "generating" | "saving" | "success" | "error">("idle");
  const [activeTab, setActiveTab] = useState<"config" | "logic">("config");
  
  // Modal State
  const [addModal, setAddModal] = useState<{ isOpen: boolean; type: 'number' | 'boolean' }>({ 
    isOpen: false, 
    type: 'number' 
  });

  // --- ACTIONS ---

  // Load
  useEffect(() => {
    if (!selectedSlug) {
      setConfig(null); 
      setBusinessContext("");
      return;
    }
    const fetchData = async () => {
      try {
        const res = await fetch(`/api/admin/intelligence?slug=${selectedSlug}`);
        const data = await res.json();
        const targetData = data.intelligence || data;

        if (targetData) {
          setConfig({
            prompt: targetData.prompt || "",
            values: targetData.values || {},
            schema: targetData.schema || {}
          });
          if (targetData.description) setBusinessContext(targetData.description);
        }
      } catch (error) {
        toast.error("Failed to load configuration.");
      }
    };
    fetchData();
  }, [selectedSlug]);

  // Generate
  const handleGenerate = async () => {
    if (!businessContext.trim()) {
      toast.warning("Please enter business requirements first.");
      return;
    }
    setStatus("generating");
    try {
      const res = await fetch("/api/admin/intelligence/generate", {
        method: "POST",
        body: JSON.stringify({ description: businessContext })
      });
      if (!res.ok) throw new Error("Generation failed");
      const generatedData = await res.json();
      setConfig(generatedData);
      setStatus("idle");
      toast.success("Intelligence configuration generated!");
    } catch (e) {
      toast.error("AI Generation failed. Please try again.");
      setStatus("error");
    }
  };

  // Save
  const handleSave = async () => {
    if (!config || !selectedSlug) return;
    setStatus("saving");
    try {
      await fetch(`/api/admin/intelligence?slug=${selectedSlug}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config)
      });
      setStatus("success");
      toast.success("Configuration deployed to production.");
      setTimeout(() => setStatus("idle"), 2000);
    } catch (e) {
      toast.error("Failed to save configuration.");
      setStatus("error");
    }
  };

  // --- MANIPULATION HANDLERS ---

  const handleAddItem = (name: string, val: any) => {
    if (!config) return;
    
    if (addModal.type === 'number') {
      // Add to values
      setConfig({
        ...config,
        values: { ...config.values, [name]: Number(val) }
      });
      toast.success(`Added ${name}`);
    } else {
      // Add to schema (Flag)
      setConfig({
        ...config,
        schema: { ...config.schema, [name]: 'boolean' }
      });
      toast.success(`Added flag ${name}`);
    }
  };

  const handleDeleteItem = (key: string, type: 'number' | 'boolean') => {
    if (!config) return;
    if (confirm(`Are you sure you want to remove '${key}'?`)) {
       if (type === 'number') {
         const newValues = { ...config.values };
         delete newValues[key];
         setConfig({ ...config, values: newValues });
       } else {
         const newSchema = { ...config.schema };
         delete newSchema[key];
         setConfig({ ...config, schema: newSchema });
       }
    }
  };

  // --- RENDER HELPERS ---
  const pricingVariables = config ? Object.entries(config.values) : [];
  const booleanFlags = config 
    ? Object.entries(config.schema).filter(([, type]) => type === 'boolean') 
    : [];

  return (
    <div className="bg-zinc-100 font-sans text-zinc-900 h-screen flex flex-col relative">
      <Toaster position="top-right" richColors />
      
      {/* MODAL OVERLAY */}
      <AddItemModal 
        isOpen={addModal.isOpen}
        onClose={() => setAddModal({ ...addModal, isOpen: false })}
        onConfirm={handleAddItem}
        type={addModal.type}
        title={addModal.type === 'number' ? "Add Pricing Variable" : "Add Logic Flag"}
      />

      {/* --- HEADER --- */}
      <header className="bg-white border-b border-zinc-200 sticky top-0 z-30 shrink-0">
        <div className="max-w-[1600px] mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-zinc-900 rounded-lg flex items-center justify-center">
                 <Bot className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-lg tracking-tight">Intelligence Architect</span>
            </div>
            <div className="h-6 w-px bg-zinc-200" />
            <div className="w-64">
               <SubdomainSelector value={selectedSlug} onChange={setSelectedSlug} />
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {config && (
              <button
                onClick={handleSave}
                disabled={status === 'saving'}
                className="flex items-center gap-2 px-5 py-2 bg-zinc-900 text-white text-sm font-semibold rounded-lg hover:bg-zinc-800 transition-all shadow-md shadow-zinc-200 active:scale-95 disabled:opacity-70"
              >
                {status === 'saving' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {status === 'success' ? "Deployed" : status === 'saving' ? "Deploying..." : "Deploy Config"}
              </button>
            )}
          </div>
        </div>
      </header>

      {/* --- MAIN WORKSPACE --- */}
      <main className="max-w-[1600px] mx-auto p-6 flex-1 w-full overflow-hidden">
        <div className="grid grid-cols-12 gap-6 h-full">
          
          {/* LEFT: INPUT */}
          <div className="col-span-12 lg:col-span-4 flex flex-col h-full bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-zinc-100 bg-zinc-50/50 flex justify-between items-center">
               <h2 className="font-semibold text-sm flex items-center gap-2 text-zinc-700">
                 <Sparkles className="w-4 h-4 text-purple-600" />
                 Source Requirements
               </h2>
            </div>
            <div className="flex-1 relative">
              <textarea
                value={businessContext}
                onChange={(e) => setBusinessContext(e.target.value)}
                className="w-full h-full p-5 text-sm text-zinc-700 leading-relaxed outline-none resize-none placeholder:text-zinc-300"
                placeholder="Paste the logic here..."
              />
            </div>
            <div className="p-4 border-t border-zinc-100 bg-white">
              <button
                onClick={handleGenerate}
                disabled={!businessContext || status === 'generating'}
                className="w-full flex items-center justify-center gap-2 py-3 bg-purple-600 hover:bg-purple-700 text-white text-sm font-bold rounded-lg transition-all shadow-md shadow-purple-100 disabled:opacity-50"
              >
                {status === 'generating' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                {status === 'generating' ? "Analyzing..." : "Auto-Build Configuration"}
              </button>
            </div>
          </div>

          {/* RIGHT: CONFIGURATION */}
          <div className="col-span-12 lg:col-span-8 flex flex-col h-full gap-6">
             {!config ? (
               <div className="h-full flex flex-col items-center justify-center text-zinc-300 border-2 border-dashed border-zinc-200 rounded-xl bg-zinc-50/30">
                 <ArrowRight className="w-8 h-8 mb-3 opacity-20" />
                 <p className="font-medium text-sm">Waiting for input to generate blueprint...</p>
               </div>
             ) : (
               <>
                 <div className="flex items-center gap-1 bg-zinc-100/50 p-1 rounded-lg w-fit border border-zinc-200/50">
                    <button 
                      onClick={() => setActiveTab('config')}
                      className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-all flex items-center gap-2 ${activeTab === 'config' ? 'bg-white text-zinc-900 shadow-sm border border-zinc-200' : 'text-zinc-500 hover:text-zinc-900'}`}
                    >
                      <LayoutDashboard className="w-3.5 h-3.5" /> Dashboard
                    </button>
                    <button 
                      onClick={() => setActiveTab('logic')}
                      className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-all flex items-center gap-2 ${activeTab === 'logic' ? 'bg-white text-zinc-900 shadow-sm border border-zinc-200' : 'text-zinc-500 hover:text-zinc-900'}`}
                    >
                      <Braces className="w-3.5 h-3.5" /> System Logic
                    </button>
                 </div>

                 {/* TAB 1: DASHBOARD */}
                 {activeTab === 'config' ? (
                   <div className="flex-1 flex flex-col gap-6 overflow-hidden">
                     
                     {/* PRICING */}
                     <div className="bg-white rounded-xl border border-zinc-200 shadow-sm flex flex-col overflow-hidden max-h-[50%]">
                       <div className="px-5 py-3 border-b border-zinc-100 bg-emerald-50/30 flex justify-between items-center">
                         <h3 className="font-bold text-sm text-zinc-800 flex items-center gap-2">
                           <Calculator className="w-4 h-4 text-emerald-600" />
                           Pricing Calculations
                         </h3>
                         <button 
                           onClick={() => setAddModal({ isOpen: true, type: 'number' })}
                           className="flex items-center gap-1.5 px-2 py-1 bg-white border border-zinc-200 rounded hover:bg-zinc-50 text-[10px] font-bold text-zinc-600 transition-colors shadow-sm"
                         >
                           <Plus className="w-3 h-3" /> ADD NEW
                         </button>
                       </div>
                       <div className="flex-1 overflow-y-auto p-4">
                         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                           {pricingVariables.map(([key, val]) => (
                             <div key={key} className="relative group flex flex-col p-4 border border-zinc-100 rounded-lg hover:border-emerald-200 transition-colors bg-zinc-50/50">
                               <button 
                                 onClick={() => handleDeleteItem(key, 'number')}
                                 className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-50 text-zinc-400 hover:text-red-500 rounded transition-all"
                                 title="Remove Variable"
                               >
                                 <Trash2 className="w-3.5 h-3.5" />
                               </button>
                               <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-2 truncate pr-6" title={key}>
                                 {formatDisplayName(key)}
                               </label>
                               <div className="flex items-center gap-2">
                                 <span className="text-zinc-400 text-sm font-medium">$</span>
                                 <input 
                                   type="number" 
                                   value={val}
                                   onChange={(e) => setConfig({
                                     ...config, 
                                     values: { ...config.values, [key]: parseFloat(e.target.value) }
                                   })}
                                   className="w-full bg-transparent font-mono font-bold text-zinc-900 outline-none text-xl"
                                 />
                               </div>
                             </div>
                           ))}
                         </div>
                       </div>
                     </div>

                     {/* FLAGS */}
                     <div className="bg-white rounded-xl border border-zinc-200 shadow-sm flex flex-col overflow-hidden flex-1">
                       <div className="px-5 py-3 border-b border-zinc-100 bg-orange-50/30 flex justify-between items-center">
                         <h3 className="font-bold text-sm text-zinc-800 flex items-center gap-2">
                           <Flag className="w-4 h-4 text-orange-600" />
                           Active Logic Flags
                         </h3>
                         <button 
                           onClick={() => setAddModal({ isOpen: true, type: 'boolean' })}
                           className="flex items-center gap-1.5 px-2 py-1 bg-white border border-zinc-200 rounded hover:bg-zinc-50 text-[10px] font-bold text-zinc-600 transition-colors shadow-sm"
                         >
                           <Plus className="w-3 h-3" /> ADD NEW
                         </button>
                       </div>
                       <div className="flex-1 overflow-y-auto p-4">
                         {booleanFlags.length === 0 ? (
                           <div className="h-full flex items-center justify-center text-zinc-400 text-sm">No boolean flags found. Add one above.</div>
                         ) : (
                           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                             {booleanFlags.map(([key]) => (
                               <div key={key} className="relative group flex items-center justify-between p-4 border border-orange-100 bg-orange-50/30 rounded-lg hover:bg-white transition-all duration-200">
                                 <div className="flex flex-col pr-6">
                                    <span className="text-[10px] font-bold text-orange-800 uppercase tracking-wider mb-0.5 truncate">
                                      {formatDisplayName(key)}
                                    </span>
                                    <span className="text-[10px] text-orange-600 font-medium">Schema Property</span>
                                 </div>
                                
                                 <button 
                                   onClick={() => handleDeleteItem(key, 'boolean')}
                                   className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-50 text-orange-300 hover:text-red-500 rounded transition-all"
                                 >
                                   <Trash2 className="w-3 h-3" />
                                 </button>
                               </div>
                             ))}
                           </div>
                         )}
                       </div>
                     </div>

                   </div>
                 ) : (
                   /* TAB 2: SYSTEM LOGIC */
                   <div className="flex-1 flex flex-col gap-6 overflow-hidden">
                     {/* SCHEMA (Read Only View) */}
                     <div className="bg-white rounded-xl border border-zinc-200 shadow-sm flex flex-col max-h-[30%]">
                       <div className="px-5 py-3 border-b border-zinc-100 bg-blue-50/30">
                         <h3 className="font-bold text-sm text-zinc-800 flex items-center gap-2">
                           <Database className="w-4 h-4 text-blue-600" />
                           Full Data Schema
                         </h3>
                       </div>
                       <div className="flex-1 overflow-y-auto p-5">
                         <div className="flex flex-wrap gap-2">
                           {Object.entries(config.schema).map(([key, type]) => (
                             <div key={key} className="px-3 py-1.5 bg-zinc-50 border border-zinc-200 rounded-md flex items-center gap-2 group hover:border-blue-300 transition-colors">
                               <div className="w-1.5 h-1.5 rounded-full bg-blue-400 group-hover:bg-blue-600" />
                               <span className="text-xs font-semibold text-zinc-700">{key}</span>
                               <span className="text-[10px] uppercase font-bold text-zinc-400 bg-zinc-100 px-1.5 py-0.5 rounded ml-1 max-w-[150px] truncate">{type}</span>
                             </div>
                           ))}
                         </div>
                       </div>
                     </div>

                     {/* PROMPT (Editable) */}
                     <div className="flex-1 bg-white rounded-xl border border-zinc-200 shadow-sm flex flex-col overflow-hidden">
                        <div className="px-5 py-3 border-b border-zinc-100 bg-amber-50/30 flex justify-between items-center">
                           <h3 className="font-bold text-sm text-zinc-800 flex items-center gap-2">
                             <FileText className="w-4 h-4 text-amber-600" />
                             Processing Rules
                           </h3>
                           <span className="text-[10px] uppercase font-bold text-amber-600/60">Editable</span>
                        </div>
                        <div className="flex-1 p-0 bg-zinc-50/50">
                           <textarea
                             value={config.prompt}
                             onChange={(e) => setConfig({ ...config, prompt: e.target.value })}
                             className="w-full h-full p-6 bg-transparent text-xs font-mono text-zinc-600 leading-relaxed outline-none resize-none"
                             spellCheck={false}
                           />
                        </div>
                     </div>
                   </div>
                 )}
               </>
             )}
          </div>
        </div>
      </main>
    </div>
  );
}