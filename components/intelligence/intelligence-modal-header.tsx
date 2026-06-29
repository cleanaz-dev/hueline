import { Sparkles, X } from 'lucide-react';

interface IntelligenceModalHeaderProps {
  isEditMode: boolean;
  onClose: () => void;
}

export function IntelligenceModalHeader({ isEditMode, onClose }: IntelligenceModalHeaderProps) {
  return (
    <div className="flex items-center justify-between px-8 py-5 border-b border-zinc-100 bg-white">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-indigo-50 rounded-lg">
          <Sparkles className="w-5 h-5 text-indigo-600" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-zinc-900 tracking-tight">
            {isEditMode ? 'Update AI Estimator logic' : 'Configure AI Estimator'}
          </h2>
          <p className="text-sm text-zinc-500">
            Set base variables and teach the AI how to price specific job conditions.
          </p>
        </div>
      </div>
      <button
        onClick={onClose}
        className="p-2 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 rounded-full transition-colors"
      >
        <X className="w-5 h-5" />
      </button>
    </div>
  );
}
