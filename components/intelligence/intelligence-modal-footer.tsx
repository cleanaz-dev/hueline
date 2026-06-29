import { Sparkles } from 'lucide-react';

interface IntelligenceModalFooterProps {
  isEditMode: boolean;
  onClose: () => void;
  onSave: () => void;
}

export function IntelligenceModalFooter({ isEditMode, onClose, onSave }: IntelligenceModalFooterProps) {
  return (
    <div className="px-8 py-5 border-t border-zinc-100 bg-white flex justify-end gap-3 shrink-0 rounded-b-2xl">
      <button
        onClick={onClose}
        className="px-6 py-2.5 text-sm font-semibold text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 rounded-xl transition-all"
      >
        Cancel
      </button>
      <button
        onClick={onSave}
        className="px-8 py-2.5 bg-zinc-900 text-white text-sm font-bold rounded-xl hover:bg-zinc-800 transition-all shadow-md active:scale-95 flex items-center gap-2"
      >
        <Sparkles className="w-4 h-4" />
        {isEditMode ? 'Save Intelligence' : 'Deploy Configuration'}
      </button>
    </div>
  );
}
