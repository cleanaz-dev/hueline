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
          // Starts 20px lower, scales up slightly
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          // Glides to its resting place
          animate={{ opacity: 1, y: 0, scale: 1 }}
          // Sinks back down 20px as it fades out
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          // Slower 0.6s duration with a beautiful, elegant easing curve
          transition={{ duration: 0.6, ease:[0.22, 1, 0.36, 1] }}
          // Changed to bottom-20
          className="absolute bottom-20 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2.5 rounded-full bg-background/80 backdrop-blur-xl border border-border/50 px-4 py-2.5 shadow-[0_8px_30px_rgb(0,0,0,0.12)] whitespace-nowrap pointer-events-none"
        >
          {/* Slower, slightly delayed pop for the checkmark to match the new vibe */}
          <motion.div
            initial={{ scale: 0, rotate: -45 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", delay: 0.15, stiffness: 200, damping: 15 }}
          >
            <CheckCircle2
              size={16}
              className="shrink-0 text-emerald-500"
              strokeWidth={2.5}
            />
          </motion.div>
          
          <span className="text-[13px] font-medium text-foreground tracking-tight">
            {message}
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}