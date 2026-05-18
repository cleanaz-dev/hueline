"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence, type Transition } from "framer-motion";
import { Sparkles, MessageSquare, Mail, X, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

export interface AiSuggestionData {
  thinking?: string;
  decision: string;
  contactRequired: boolean;
  suggestedSms?: string;
  suggestedEmail?: { subject: string; body: string };
}

interface AiActionDockProps {
  isLoading: boolean;
  suggestion: AiSuggestionData | null;
  onAnalyze: () => void;
  onClear: () => void;
  onUseSms: (text: string) => void;
  onUseEmail: (subject: string, body: string) => void;
}

// ─── PHYSICS CONFIG ─────────────────────────────────────────────────────────────
const springConfig: Transition = {
  type: "spring",
  bounce: 0.2,
  duration: 0.6,
};

export function AiActionDock({
  isLoading,
  suggestion,
  onAnalyze,
  onClear,
  onUseSms,
  onUseEmail,
}: AiActionDockProps) {
  const[displayedText, setDisplayedText] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  // Smooth Typewriter Effect
  useEffect(() => {
    if (!suggestion?.decision) return;
    setDisplayedText("");
    setIsTyping(true);

    let i = 0;
    const full = suggestion.decision;
    const interval = setInterval(() => {
      if (i < full.length) {
        setDisplayedText(full.slice(0, i + 1));
        i++;
      } else {
        setIsTyping(false);
        clearInterval(interval);
      }
    }, 20);

    return () => clearInterval(interval);
  }, [suggestion]);

  // Determine the current visual state
  const state = isLoading ? "LOADING" : suggestion ? "RESOLVED" : "IDLE";

  return (
    <div className="flex justify-center w-full py-2">
      {/* 
        THE MASTER CONTAINER 
        Automatically morphs its width, height, and border-radius between the Pill and the Card
      */}
      <motion.div
        layout
        transition={springConfig}
        className={cn(
          "relative overflow-hidden border shadow-sm",
          // IDLE: Looks like the original premium pill
          state === "IDLE" 
            ? "group bg-white dark:bg-zinc-900 border-purple-500/30 rounded-full cursor-pointer hover:shadow-md hover:border-purple-500/50 hover:bg-purple-50 dark:hover:bg-purple-500/10" 
          // LOADING: Matches the pill shape but static
            : state === "LOADING"
            ? "bg-white dark:bg-zinc-900 border-purple-500/20 rounded-full cursor-default"
          // RESOLVED: Morphs into the Apple-style Smart Card
            : "bg-white/90 dark:bg-zinc-950/90 backdrop-blur-xl border-purple-500/20 rounded-3xl w-full max-w-2xl shadow-purple-500/5"
        )}
        onClick={state === "IDLE" ? onAnalyze : undefined}
      >
        
        {/* ─── THE GLIMMER BAR (Only in Resolved State) ─── */}
        <AnimatePresence>
          {state === "RESOLVED" && (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              className="absolute top-0 left-0 right-0 h-[2px] overflow-hidden opacity-70"
            >
              <motion.div
                animate={{ x:["-100%", "200%"] }}
                transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                className="w-1/2 h-full bg-gradient-to-r from-transparent via-purple-500 to-transparent"
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* ─── CONTENT SWITCHER ─── */}
        <AnimatePresence mode="wait">
          
          {/* STATE 1: IDLE */}
          {state === "IDLE" && (
            <motion.div
              key="idle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, transition: { duration: 0.1 } }}
              className="flex items-center justify-center gap-2 px-5 py-2.5"
            >
              <Sparkles size={14} className="text-purple-500 group-hover:animate-pulse" />
              <span className="text-purple-700 dark:text-purple-400 text-xs font-semibold uppercase tracking-wider">
                Analyze Next Step
              </span>
            </motion.div>
          )}

          {/* STATE 2: LOADING (Your Original UI Restored via Framer) */}
          {state === "LOADING" && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, transition: { duration: 0.1 } }}
              className="relative flex items-center gap-3 px-5 py-2.5"
            >
              {/* Shimmer Sweep Background */}
              <motion.div
                animate={{ x:["-100%", "200%"] }}
                transition={{ repeat: Infinity, duration: 1.8, ease: "linear" }}
                className="absolute inset-0 w-[50%] bg-gradient-to-r from-transparent via-purple-500/10 to-transparent z-0"
              />

              {/* Your 3 Colored Orbs */}
              <div className="flex gap-1.5 items-center relative z-10">
                {["#3b82f6", "#a855f7", "#ec4899"].map((color, i) => (
                  <motion.span
                    key={i}
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ backgroundColor: color }}
                    animate={{ scale: [0.8, 1.3, 0.8], opacity:[0.4, 1, 0.4] }}
                    transition={{
                      duration: 1.4,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: i * 0.2, // Staggers the pulse
                    }}
                  />
                ))}
              </div>

              {/* Your Mini Skeleton Lines */}
              <div className="flex flex-col gap-1.5 relative z-10 mr-1">
                <motion.div 
                  className="h-2 w-32 sm:w-36 rounded-full bg-zinc-200 dark:bg-zinc-700" 
                  animate={{ opacity:[0.5, 1, 0.5] }} 
                  transition={{ duration: 1.5, repeat: Infinity }} 
                />
                <motion.div 
                  className="h-2 w-20 sm:w-24 rounded-full bg-zinc-200 dark:bg-zinc-700" 
                  animate={{ opacity: [0.3, 0.7, 0.3] }} 
                  transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }} 
                />
              </div>

              <span className="text-[11px] font-medium text-zinc-400 relative z-10 ml-1">
                Reviewing thread...
              </span>
            </motion.div>
          )}

          {/* STATE 3: RESOLVED (The Native App Card) */}
          {state === "RESOLVED" && suggestion && (
            <motion.div
              key="resolved"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="p-5 sm:p-6 flex flex-col"
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-500/10 px-2.5 py-1 rounded-md">
                  <Sparkles size={13} />
                  <span className="text-[10px] font-bold uppercase tracking-widest">
                    AI Guidance
                  </span>
                </div>
                <button
                  onClick={onClear}
                  className="text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-full p-1.5"
                >
                  <X size={13} />
                </button>
              </div>

              {/* Typewriter Body */}
              <p className="text-[13px] sm:text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed min-h-[40px]">
                {displayedText}
                {isTyping && (
                  <motion.span
                    animate={{ opacity: [1, 0] }}
                    transition={{ repeat: Infinity, duration: 0.7, ease: "linear" }}
                    className="inline-block w-[2px] h-[14px] bg-purple-500 ml-1 align-middle"
                  />
                )}
              </p>

              {/* Actions - Staggered reveal after typing finishes */}
              <AnimatePresence>
                {suggestion.contactRequired && !isTyping && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
                    className="flex flex-wrap gap-2.5 mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-800/50"
                  >
                    {suggestion.suggestedSms && (
                      <button
                        onClick={() => onUseSms(suggestion.suggestedSms!)}
                        className="group flex items-center gap-2 px-3.5 py-2 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 text-[12px] font-semibold rounded-xl border border-blue-200 dark:border-blue-500/20 hover:bg-blue-500 hover:text-white dark:hover:bg-blue-600 dark:hover:text-white transition-all shadow-sm"
                      >
                        <MessageSquare size={14} />
                        Draft SMS
                        <ArrowRight size={13} className="opacity-50 group-hover:opacity-100 transition-opacity ml-0.5" />
                      </button>
                    )}
                    {suggestion.suggestedEmail && (
                      <button
                        onClick={() => onUseEmail(suggestion.suggestedEmail!.subject, suggestion.suggestedEmail!.body)}
                        className="group flex items-center gap-2 px-3.5 py-2 bg-purple-50 dark:bg-purple-500/10 text-purple-700 dark:text-purple-400 text-[12px] font-semibold rounded-xl border border-purple-200 dark:border-purple-500/20 hover:bg-purple-500 hover:text-white dark:hover:bg-purple-600 dark:hover:text-white transition-all shadow-sm"
                      >
                        <Mail size={14} />
                        Draft Email
                        <ArrowRight size={13} className="opacity-50 group-hover:opacity-100 transition-opacity ml-0.5" />
                      </button>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}