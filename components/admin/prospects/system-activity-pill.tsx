"use client";

import { 
  MousePointerClick, 
  ExternalLink, 
  CreditCard, 
  FileText, 
  CheckCircle2, 
  Activity 
} from "lucide-react";

interface SystemActivityPillProps {
  msg: {
    body: string;
    createdAt: Date | string;
    type?: string;
    metadata?: any;
  };
}

// Optional: Map specific activity types to specific icons for a richer UI later
const getIconForActivity = (type?: string) => {
  if (!type) return MousePointerClick;
  if (type.includes("PAID") || type.includes("BILLING")) return CreditCard;
  if (type.includes("FORM") || type.includes("DOC")) return FileText;
  if (type.includes("COMPLETED") || type.includes("APPROVED")) return CheckCircle2;
  return Activity;
};

export function SystemActivityPill({ msg }: SystemActivityPillProps) {
  const time = new Date(msg.createdAt).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  const Icon = getIconForActivity(msg.type);

  return (
    <div className="flex justify-center w-full my-6 relative group">
      {/* Faint divider line behind the pill */}
      <div className="absolute inset-0 flex items-center" aria-hidden="true">
        <div className="w-full border-t border-border/40" />
      </div>

      {/* The Pill & Optional Actions Container */}
      <div className="relative flex items-center gap-2">
        
        {/* Main Activity Pill */}
        <span className="bg-background text-muted-foreground text-[11px] px-4 py-1.5 rounded-full font-medium flex items-center gap-2 shadow-sm border border-border/60 transition-colors group-hover:border-border">
          <Icon size={12} className="text-zinc-400" />
          <span>{msg.body}</span>
          <span className="opacity-50 ml-1 font-normal">{time}</span>
        </span>

        {/* 🚀 THE MAGIC: Dynamic Metadata Action Button */}
        {msg.metadata?.actionUrl && (
          <a
            href={msg.metadata.actionUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-background text-indigo-600 dark:text-indigo-400 text-[10px] px-3 py-1.5 rounded-full font-bold flex items-center gap-1.5 shadow-sm border border-border/60 hover:bg-muted hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors uppercase tracking-wider"
          >
            {msg.metadata.actionLabel || "View"}
            <ExternalLink size={10} strokeWidth={2.5} />
          </a>
        )}

      </div>
    </div>
  );
}