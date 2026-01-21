"use client";

import { useState, useMemo } from "react";
import {
  ScrollText,
  ChevronDown,
  MessageSquare,
  CreditCard,
  GitCommit,
  Image as ImageIcon,
  Share2,
  StickyNote,
  Phone,
  Video,
  Bot,
  User,
  Settings,
  ShieldAlert,
  HardHat,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { LogType, LogActor } from "@/app/generated/prisma"; // Adjust import path as needed

// --- CONFIG ---

// 1. Icon & Color Mapping for Log Types
const TYPE_CONFIG: Record<string, { icon: any; color: string; bg: string }> = {
  CALL: { icon: Phone, color: "text-slate-500", bg: "bg-slate-100" },
  ROOM: { icon: Video, color: "text-slate-500", bg: "bg-slate-100" },
  MOCKUP: { icon: ImageIcon, color: "text-indigo-600", bg: "bg-indigo-50" },
  PAYMENT: { icon: CreditCard, color: "text-emerald-600", bg: "bg-emerald-50" },
  STATUS_CHANGE: { icon: GitCommit, color: "text-amber-600", bg: "bg-amber-50" },
  SMS: { icon: MessageSquare, color: "text-blue-600", bg: "bg-blue-50" },
  NOTE: { icon: StickyNote, color: "text-yellow-600", bg: "bg-yellow-50" },
  SHARE: { icon: Share2, color: "text-slate-600", bg: "bg-slate-50" },
  DEFAULT: { icon: ScrollText, color: "text-slate-400", bg: "bg-slate-50" },
};

// 2. Actor Badges (Subtle visual cues for who did what)
const ACTOR_CONFIG: Record<string, { label: string; icon: any }> = {
  AI: { label: "AI Assistant", icon: Bot },
  SYSTEM: { label: "System", icon: Settings },
  PAINTER: { label: "Admin", icon: HardHat },
  CLIENT: { label: "Client", icon: User },
};

interface IntelLogsProps {
  logs?: any[]; // Replace 'any' with your Prisma Logs type
}

export function IntelLogs({ logs = [] }: IntelLogsProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // --- DATA PROCESSING ---
  const { groupedLogs, totalLogs } = useMemo(() => {
    if (!logs.length) return { groupedLogs: {}, totalLogs: 0 };

    // 1. Sort by Date Descending
    const sorted = [...logs].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    // 2. Group by Date Key (e.g., "Oct 24, 2024")
    const grouped: Record<string, typeof logs> = {};
    sorted.forEach((log) => {
      const dateKey = new Date(log.createdAt).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
      if (!grouped[dateKey]) grouped[dateKey] = [];
      grouped[dateKey].push(log);
    });

    return { groupedLogs: grouped, totalLogs: sorted.length };
  }, [logs]);

  if (totalLogs === 0) return null;

  return (
    <div className="w-full bg-white rounded-xl border border-slate-200 shadow-sm transition-all duration-200 hover:shadow-md mb-6 overflow-hidden">
      
      {/* HEADER */}
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className="px-4 py-4 cursor-pointer bg-white hover:bg-slate-50/50 transition-colors flex justify-between items-center group select-none"
      >
        <div className="flex items-center gap-4">
          <div
            className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center transition-colors duration-200",
              isExpanded
                ? "bg-slate-800 text-white"
                : "bg-slate-100 text-slate-500 group-hover:bg-slate-200"
            )}
          >
            <ScrollText className="w-4 h-4" />
          </div>

          <div className="flex flex-col">
            <h4 className="font-bold text-sm text-slate-900">Activity Log</h4>
            <div className="text-xs text-slate-500">
              {totalLogs} Event{totalLogs !== 1 && "s"} recorded
            </div>
          </div>
        </div>

        <ChevronDown
          className={cn(
            "w-5 h-5 text-slate-400 transition-transform duration-300",
            isExpanded && "rotate-180"
          )}
        />
      </div>

      {/* EXPANDABLE TIMELINE */}
      <div
        className={cn(
          "grid transition-[grid-template-rows] duration-300 ease-out",
          isExpanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        )}
      >
        <div className="overflow-hidden">
          <div className="border-t border-slate-100 bg-slate-50/30 p-4 sm:p-6">
            
            {/* DATE GROUPS */}
            <div className="space-y-8">
              {Object.entries(groupedLogs).map(([date, dayLogs], groupIdx) => (
                <div key={date} className="relative">
                  
                  {/* Sticky Date Header */}
                  <div className="sticky top-0 z-10 mb-4">
                    <span className="inline-block bg-white border border-slate-200 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider text-slate-500 shadow-sm">
                      {date}
                    </span>
                  </div>

                  {/* Vertical Line */}
                  <div className="absolute left-4 top-8 bottom-0 w-px bg-slate-200/80 -z-10" />

                  {/* LOG ITEMS */}
                  <div className="space-y-4">
                    {dayLogs.map((log) => {
                      const typeConfig = TYPE_CONFIG[log.type] || TYPE_CONFIG.DEFAULT;
                      const actorConfig = ACTOR_CONFIG[log.actor] || ACTOR_CONFIG.SYSTEM;
                      const Icon = typeConfig.icon;
                      const ActorIcon = actorConfig.icon;
                      
                      // Handle Metadata (Example: Extracting details safely)
                      const metadata = (log.metadata as Record<string, any>) || {};

                      return (
                        <div key={log.id} className="relative flex gap-4 items-start group/item">
                          
                          {/* Timeline Node */}
                          <div
                            className={cn(
                              "relative z-10 w-8 h-8 rounded-full flex items-center justify-center shrink-0 border bg-white transition-colors",
                              typeConfig.color,
                              "border-slate-200 group-hover/item:border-slate-300"
                            )}
                          >
                            <Icon className="w-3.5 h-3.5" />
                          </div>

                          {/* Card Content */}
                          <div className="flex-1 min-w-0 bg-white border border-slate-100 rounded-lg p-3 hover:border-slate-300 hover:shadow-sm transition-all">
                            
                            {/* Top Row: Title & Time */}
                            <div className="flex justify-between items-start gap-2 mb-1">
                              <span className="text-xs font-semibold text-slate-800 line-clamp-1">
                                {log.title}
                              </span>
                              <span className="text-[10px] text-slate-400 font-mono shrink-0">
                                {new Date(log.createdAt).toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </span>
                            </div>

                            {/* Middle Row: Description */}
                            {log.description && (
                              <p className="text-xs text-slate-600 mb-2 leading-relaxed">
                                {log.description}
                              </p>
                            )}

                            {/* Bottom Row: Actor & Metadata Badges */}
                            <div className="flex items-center gap-2 mt-2 pt-2 border-t border-slate-50">
                              
                              {/* Actor Badge */}
                              <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-medium uppercase tracking-wide">
                                <ActorIcon className="w-3 h-3" />
                                {actorConfig.label}
                              </div>

                              {/* Special Metadata Rendering */}
                              {/* 1. Mockups/Images */}
                              {log.type === "MOCKUP" && metadata.imageUrl && (
                                <div className="ml-auto text-[10px] text-indigo-500 font-bold flex items-center gap-1 cursor-pointer hover:underline">
                                  <ImageIcon className="w-3 h-3" /> View Image
                                </div>
                              )}

                              {/* 2. Status Changes */}
                              {log.type === "STATUS_CHANGE" && metadata.oldStatus && (
                                <div className="ml-auto text-[9px] font-mono text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100">
                                  {metadata.oldStatus} → {metadata.newStatus}
                                </div>
                              )}
                              
                              {/* 3. SMS Context */}
                              {log.type === "SMS" && (
                                <div className="ml-auto flex items-center gap-1 text-[10px] text-blue-500 font-medium">
                                   Read Message
                                </div>
                              )}

                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}