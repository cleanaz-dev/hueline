// system-event-call-meta.tsx

export interface CallMetadataProps {
  meta: {
    callSummary?: string;
    duration?: number | string;
    estimatedValue?: number;
    callReason?: string;
  };
}

export function CallMetadata({ meta }: CallMetadataProps) {
  if (!meta?.callSummary && !meta?.duration) return null;
  
  return (
    <div className="flex flex-col gap-2 mt-2 p-3.5 rounded-xl bg-zinc-50/80 dark:bg-zinc-900/40 border border-zinc-100/80 dark:border-zinc-800/60 shadow-sm">
      {meta.callSummary && (
        <p className="text-[12px] text-zinc-600 dark:text-zinc-300 leading-relaxed">
          {meta.callSummary}
        </p>
      )}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] font-medium text-zinc-500 pt-1">
        {meta.duration && <span>⏱ {meta.duration}s</span>}
        {meta.estimatedValue != null && (
          <span className="text-zinc-800 dark:text-zinc-200">
            Est: ${meta.estimatedValue}
          </span>
        )}
        {meta.callReason && <span>#{meta.callReason.toLowerCase()}</span>}
      </div>
    </div>
  );
}
