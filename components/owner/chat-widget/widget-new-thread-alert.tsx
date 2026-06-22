"use client";

import { motion } from "framer-motion";
import { Phone, MessageSquare, X } from "lucide-react";
import { useOwner, ChatThreadModel } from "@/context/owner-context"; // Import your model

// Accept the alert as a prop
export function WidgetNewThreadAlert({ threadAlert }: { threadAlert: ChatThreadModel }) {
  const { dismissNewThreadAlert, openNewThreadAlert } = useOwner();

  // Safely grab the customer name
  const customerName = threadAlert.customer?.name || "Unknown Caller";
  const isCall = true; // Assume call for now

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.9 }}
      className="absolute bottom-20 right-0 z-50 mb-4 w-[300px] pointer-events-auto"
    >
      <div className="relative overflow-hidden bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl p-4 cursor-pointer hover:border-emerald-500/50 transition-colors group"
        onClick={openNewThreadAlert}
      >
        <div className="absolute inset-0 bg-emerald-500/5 dark:bg-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />

        <div className="flex items-start gap-3 relative z-10">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 shrink-0">
            {isCall ? <Phone size={18} className="animate-pulse" /> : <MessageSquare size={18} />}
          </div>
          
          <div className="flex flex-col min-w-0 pr-4">
            <span className="text-[11px] font-bold tracking-wider uppercase text-emerald-600 dark:text-emerald-500">
              New Incoming Thread
            </span>
            <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate mt-0.5">
              {customerName}
            </span>
            <span className="text-xs text-zinc-500 dark:text-zinc-400 truncate mt-0.5">
              Click to open chat
            </span>
          </div>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation(); 
            dismissNewThreadAlert();
          }}
          className="absolute top-3 right-3 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 p-1 bg-white dark:bg-zinc-900 rounded-full"
        >
          <X size={14} />
        </button>
      </div>
    </motion.div>
  );
}