// system-event-form-meta.tsx

export interface FormMetadataProps {
  meta: {
    rooms?: string[];
    paintType?: string;
    sqft?: number | string;
  };
}

export function FormMetadata({ meta }: FormMetadataProps) {
  if (!meta?.rooms?.length && !meta?.paintType && !meta?.sqft) return null;
  
  return (
    <div className="flex flex-wrap items-center gap-2 mt-2 p-3 rounded-xl bg-zinc-50/80 dark:bg-zinc-900/40 border border-zinc-100/80 dark:border-zinc-800/60 shadow-sm">
      {meta.paintType && (
        <span className="px-2.5 py-1 rounded-md bg-white dark:bg-zinc-800 text-[11px] font-medium text-zinc-600 dark:text-zinc-300 border border-zinc-200/60 dark:border-zinc-700">
          {meta.paintType}
        </span>
      )}
      {meta.sqft && (
        <span className="px-2.5 py-1 rounded-md bg-white dark:bg-zinc-800 text-[11px] font-medium text-zinc-600 dark:text-zinc-300 border border-zinc-200/60 dark:border-zinc-700">
          {meta.sqft} sqft
        </span>
      )}
      {meta.rooms?.map((room: string) => (
        <span
          key={room}
          className="px-2.5 py-1 rounded-md bg-white dark:bg-zinc-800 text-[11px] font-medium text-zinc-600 dark:text-zinc-300 border border-zinc-200/60 dark:border-zinc-700 capitalize"
        >
          {room}
        </span>
      ))}
    </div>
  );
}
