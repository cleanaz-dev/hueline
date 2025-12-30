"use client";

import { AlertTriangle, Loader2, X } from "lucide-react";

interface DeleteIntelligenceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  itemName: string;
  isDeleting: boolean;
}

export function DeleteIntelligenceModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  itemName,
  isDeleting 
}: DeleteIntelligenceModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden border border-zinc-200 animate-in fade-in zoom-in-95 duration-200">
        
        {/* HEADER - Same as Add Modal */}
        <div className="px-6 py-4 border-b border-zinc-100 flex justify-between items-center bg-zinc-50/50">
          <h3 className="font-bold text-zinc-900">Delete Variable</h3>
          <button onClick={onClose} className="p-1 hover:bg-zinc-200 rounded-md transition-colors">
            <X className="w-4 h-4 text-zinc-500" />
          </button>
        </div>

        {/* BODY */}
        <div className="p-6">
          <div className="flex items-start gap-4 mb-4">
          
            <div className="space-y-1 mt-0.5">
              <h4 className="font-semibold text-zinc-900 ">Are you sure?</h4>
              <p className="text-zinc-500 leading-relaxed text-balance">
              Remove <span className="font-mono font-bold text-zinc-800 bg-zinc-100 px-1.5 py-0.5 rounded text-xs mx-1">{itemName}.</span>  
              </p>
              <p className="text-xs text-red-800">This action cannot be undone.</p>
            </div>
          </div>

          {/* BUTTONS - Same Layout as Add Modal */}
          <div className="flex justify-end gap-2 mt-6">
             <button 
               onClick={onClose}
               disabled={isDeleting}
               className="px-4 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-100 rounded-lg transition-colors"
             >
               Cancel
             </button>
             <button 
               onClick={onConfirm}
               disabled={isDeleting}
               className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-md shadow-red-100 disabled:opacity-70 transition-all"
             >
               {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Delete Variable"}
             </button>
          </div>
        </div>
      </div>
    </div>
  );
}