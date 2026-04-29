"use client";

import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2 } from "lucide-react";

interface DrawerToastProps {
  message: string | null;
}

export function DrawerToast({ message }: DrawerToastProps) {
  return (
    <AnimatePresence>
      {message && (
        <motion.div
          key={message}
          initial={{ opacity: 0, y: 60, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="absolute bottom-24 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 rounded-full bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 px-4 py-2 text-xs font-medium shadow-lg whitespace-nowrap pointer-events-none"
        >
          <CheckCircle2
            size={13}
            className="shrink-0 text-emerald-500"
          />
          {message}
        </motion.div>
      )}
    </AnimatePresence>
  );
}