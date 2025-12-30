"use client";

import { useState, useEffect } from "react";
import { useSuperAdmin } from "@/context/super-admin-context";
import { SubdomainSelector } from "./subdomain-selector";
import { toast, Toaster } from "sonner";
import { Loader2, Save, Bot, X } from "lucide-react";

// Imported Components
import { IntelligenceSourcePanel } from "./intelligence-source-panel";
import { IntelligenceConfig, IntelligenceConfigEditor } from "./intelligence-config-editor";
import { AddIntelligenceModal } from "./add-intelligence-modal";
import { DeleteIntelligenceModal } from "./delete-intelligence-modal";

// --- HELPERS ---
const formatKeyName = (name: string) => {
  return name
    .toLowerCase()
    .replace(/\s+/g, '_')
    .replace(/[^a-z0-9_]/g, '');
};

// --- MAIN PAGE ---

export default function AdminIntelligencePage() {
  const { clients } = useSuperAdmin();
  const [selectedSlug, setSelectedSlug] = useState<string>("");
  
  // Data State
  const [businessContext, setBusinessContext] = useState("");
  const [config, setConfig] = useState<IntelligenceConfig | null>(null);

  // UI State
  const [status, setStatus] = useState<"idle" | "generating" | "saving" | "success" | "error">("idle");
  const [isDeleting, setIsDeleting] = useState(false);

  // Modal States
  const [addModal, setAddModal] = useState<{ isOpen: boolean; type: 'number' | 'boolean' }>({ 
    isOpen: false, 
    type: 'number' 
  });
  
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; key: string; type: 'number' | 'boolean' }>({
    isOpen: false,
    key: "",
    type: 'number'
  });

  // Load Data
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

  // Generate AI Config
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

  // Save Full Config (Deployment)
  const handleSave = async () => {
    if (!config || !selectedSlug) return;
    setStatus("saving");
    try {
      // Reusing the general CRUD API for saving the full config
      await fetch(`/api/admin/intelligence/crud`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
           slug: selectedSlug,
           action: "UPDATE_FULL",
           value: config // Send the entire config object
        })
      });
      setStatus("success");
      toast.success("Configuration deployed to production.");
      setTimeout(() => setStatus("idle"), 2000);
    } catch (e) {
      toast.error("Failed to save configuration.");
      setStatus("error");
    }
  };

  // --- ITEM HANDLERS ---

  const handleAddItem = async (name: string, val: any) => {
    if (!config) return; 

    try {
      await fetch("/api/admin/intelligence/crud", {
        method: "POST",
        body: JSON.stringify({
          slug: selectedSlug,
          action: "ADD_ITEM",
          type: addModal.type, // 'number' or 'boolean'
          key: name,
          value: val
        })
      });
      
      toast.success(`Added ${name}`);
      
      // Optimistic Update for immediate UI feedback
      if (addModal.type === 'number') {
        setConfig({
          ...config,
          values: { ...config.values, [name]: Number(val) }
        });
      } else {
        setConfig({
          ...config,
          schema: { ...config.schema, [name]: 'boolean' } // Ensure schema is updated
        });
      }
      setAddModal({ ...addModal, isOpen: false }); // Close modal on success
    } catch (error) {
      toast.error("Failed to add item");
    }
  };

  // 1. Opens the confirmation dialog
  const openDeleteModal = (key: string, type: 'number' | 'boolean') => {
    setDeleteModal({ isOpen: true, key, type });
  };

  // 2. Actually performs the delete logic
  const confirmDelete = async () => {
    if (!config || !deleteModal.key) return;
    
    setIsDeleting(true);
    try {
      await fetch("/api/admin/intelligence/crud", {
        method: "POST",
        body: JSON.stringify({
          slug: selectedSlug,
          action: "DELETE_ITEM",
          type: deleteModal.type,
          key: deleteModal.key
        })
      });
      
      toast.success(`Deleted ${deleteModal.key}`);
      
      // Update local config state
      if (deleteModal.type === 'number') {
        const newValues = { ...config.values };
        delete newValues[deleteModal.key];
        setConfig({ ...config, values: newValues });
      } else {
        const newSchema = { ...config.schema };
        delete newSchema[deleteModal.key];
        setConfig({ ...config, schema: newSchema });
      }

      setDeleteModal({ ...deleteModal, isOpen: false }); // Close modal on success
    } catch (error) {
      toast.error("Failed to delete item");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="bg-zinc-100 font-sans text-zinc-900 h-screen flex flex-col relative">
      <Toaster position="top-right" richColors />
      
      <AddIntelligenceModal 
        isOpen={addModal.isOpen}
        onClose={() => setAddModal({ ...addModal, isOpen: false })}
        onConfirm={handleAddItem}
        type={addModal.type}
        title={addModal.type === 'number' ? "Add Pricing Variable" : "Add Logic Flag"}
      />

      <DeleteIntelligenceModal 
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ ...deleteModal, isOpen: false })}
        onConfirm={confirmDelete}
        itemName={deleteModal.key}
        isDeleting={isDeleting}
      />

      {/* HEADER */}
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

      {/* MAIN LAYOUT */}
      <main className="max-w-[1600px] mx-auto p-6 flex-1 w-full overflow-hidden">
        <div className="grid grid-cols-12 gap-6 h-full">
          
          <IntelligenceSourcePanel 
             context={businessContext} 
             setContext={setBusinessContext} 
             onGenerate={handleGenerate} 
             status={status}
          />

          <IntelligenceConfigEditor 
             config={config} 
             onUpdateConfig={setConfig}
             onRequestAdd={(type) => setAddModal({ isOpen: true, type })}
             onRequestDelete={openDeleteModal} // Pass the modal opener function
          />

        </div>
      </main>
    </div>
  );
}