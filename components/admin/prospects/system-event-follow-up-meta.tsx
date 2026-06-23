// system-event-follow-up-meta.tsx

"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CalendarX, Info, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useOwner } from "@/context/owner-context";

export interface FollowUpMetadataProps {
  meta: {
    triggerAt?: string | Date;
    reason?: string;
  };
  followUpId?: string;

}

export function FollowUpMetadata({
  meta,
  followUpId,
  
}: FollowUpMetadataProps) {
  const { handleCancelFollowUp, isCancellingFollowUp, activeThread: customer } =
    useOwner();

  const [cancelled, setCancelled] = useState(false);

  if (!meta?.triggerAt || !followUpId) return null;

  const triggerDate = new Date(meta.triggerAt);
  const datePart = triggerDate.toLocaleDateString([], {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
  const timePart = triggerDate.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  const handleCancel = async () => {
    if (!handleCancelFollowUp) return;
    try {
      await handleCancelFollowUp(customer?.threadId!, customer?.id!, followUpId);
      setCancelled(true);
    } catch (e) {
      console.error("Failed to cancel follow-up", e);
    } finally {
      
    }
  };

  return (
    <div className="mt-3 overflow-hidden">
      <AnimatePresence mode="wait">
        {cancelled ? (
          <motion.div
            key="cancelled"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="flex items-center gap-3 p-3 rounded-lg bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800/80"
          >
            <CalendarX size={14} className="text-zinc-400" />
            <span className="text-[12px] text-zinc-500 dark:text-zinc-400">
              Scheduled follow-up was cancelled.
            </span>
          </motion.div>
        ) : (
          <motion.div
            key="active"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, height: 0 }}
            className="relative flex items-start justify-between p-3.5 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-sm overflow-hidden"
          >
            {/* Pro enterprise accent strip on the left edge */}
            <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-amber-500/80 dark:bg-amber-500/60" />

            {/* Left side: Status & Reason & Time */}
            <div className="flex items-start gap-3 pl-1 flex-1 pr-4">
              <div className="flex items-center justify-center w-8 h-8 rounded-md bg-amber-50 dark:bg-amber-500/10 border border-amber-200/60 dark:border-amber-500/20 text-amber-600 dark:text-amber-500 shrink-0 mt-0.5">
                <Info size={14} strokeWidth={2.5} />
              </div>
              <div className="flex flex-col">
                {/* ─── RENDER REASON HERE ─── */}
                {meta.reason && (
                  <div className="text-sm text-zinc-700 dark:text-zinc-300 mt-1 leading-relaxed">
                    <p className="text-[10px] font-bold text-zinc-900 dark:text-zinc-400 tracking-wide">
                      REASON
                    </p>{" "}
                    <p>{meta.reason}</p>
                  </div>
                )}
                <div className="flex justify-between mt-0.5">
                  <div className="text-[12px] text-zinc-500 dark:text-zinc-400 mt-auto">
                    Scheduled for{" "}
                    <strong className="font-medium text-zinc-700 dark:text-zinc-300">
                      {datePart} at {timePart}
                    </strong>
                  </div>
                  {isCancellingFollowUp && (
                    <Button
                      onClick={handleCancel}
                      disabled={isCancellingFollowUp}
                      className="flex items-center gap-1.5 text-[12px]"
                      variant="ghost"
                      size="sm"
                    >
                      <X size={13} strokeWidth={2.5} />
                      {isCancellingFollowUp ? "Cancelling..." : "Cancel"}
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* Right side: Action Button */}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
