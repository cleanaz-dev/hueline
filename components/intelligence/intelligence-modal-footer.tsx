"use client"

import { Sparkles, Loader2 } from 'lucide-react';

interface IntelligenceModalFooterProps {
  isEditMode: boolean;
  isSaving: boolean;
  onClose: () => void;
  onSave: () => void;
}

export function IntelligenceModalFooter({ 
  isEditMode, 
  isSaving,
  onClose, 
  onSave 
}: IntelligenceModalFooterProps) {
  
  return (
    <div className="px-8 py-5 border-t border-zinc-100 bg-white flex justify-end gap-3 shrink-0 rounded-b-2xl">
      <button
        onClick={onClose}
        disabled={isSaving}
        className="px-6 py-2.5 text-sm font-semibold text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 rounded-xl transition-all disabled:opacity-50"
      >
        Cancel
      </button>
      <button
        onClick={onSave}
        disabled={isSaving}
        className="px-8 py-2.5 bg-zinc-900 text-white text-sm font-bold rounded-xl hover:bg-zinc-800 transition-all shadow-md active:scale-95 flex items-center gap-2 disabled:opacity-80 disabled:active:scale-100"
      >
        {isSaving ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Sparkles className="w-4 h-4" />
        )}
        {isSaving ? 'Processing Logic...' : isEditMode ? 'Save Intelligence' : 'Deploy Configuration'}
      </button>
    </div>
  );
}