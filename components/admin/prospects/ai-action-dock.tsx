"use client";

import { useState, useEffect } from "react";
import { Sparkles, MessageSquare, Mail, X, ArrowRight } from "lucide-react";

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

export function AiActionDock({
  isLoading,
  suggestion,
  onAnalyze,
  onClear,
  onUseSms,
  onUseEmail,
}: AiActionDockProps) {
  const [smsUsed, setSmsUsed] = useState(false);
  const [emailUsed, setEmailUsed] = useState(false);
  const [displayedText, setDisplayedText] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  // Typewriter effect when suggestion arrives
  useEffect(() => {
    if (!suggestion?.decision) return;
    setSmsUsed(false);
    setEmailUsed(false);
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
    }, 16);

    return () => clearInterval(interval);
  }, [suggestion]);

  // STATE 1: IDLE
  if (!suggestion && !isLoading) {
    return (
      <div className="flex justify-center w-full py-2">
        <button
          onClick={onAnalyze}
          className="group flex items-center gap-2 px-4 py-2 bg-white dark:bg-zinc-900 border border-purple-500/30 text-purple-700 dark:text-purple-400 text-xs font-semibold uppercase tracking-wider rounded-full shadow-sm hover:shadow-md hover:border-purple-500/50 hover:bg-purple-50 dark:hover:bg-purple-500/10 transition-all duration-300"
        >
          <Sparkles
            size={14}
            className="text-purple-500 group-hover:animate-pulse"
          />
          Analyze Next Step
        </button>
      </div>
    );
  }

  // STATE 2: LOADING — animated orbs + shimmer lines
  if (isLoading) {
    return (
      <div className="flex justify-center w-full py-2">
        <div className="relative flex items-center gap-3 px-5 py-2.5 bg-white dark:bg-zinc-900 border border-purple-500/20 rounded-full shadow-sm overflow-hidden">
          {/* shimmer sweep */}
          <div className="absolute inset-0 bg-linear-to-r from-transparent via-purple-500/5 to-transparent animate-[shimmer_1.8s_infinite] -translate-x-full" />
          {/* pulsing orbs */}
          <div className="flex gap-1.5 items-center">
            {[0, 200, 400].map((delay, i) => (
              <span
                key={i}
                className="w-1.5 h-1.5 rounded-full animate-[orbPulse_1.4s_ease-in-out_infinite]"
                style={{
                  animationDelay: `${delay}ms`,
                  background: ["#3b82f6", "#a855f7", "#ec4899"][i],
                }}
              />
            ))}
          </div>
          {/* skeleton lines */}
          <div className="flex flex-col gap-1">
            <div className="h-2 w-36 rounded-full bg-zinc-200 dark:bg-zinc-700 animate-pulse" />
            <div className="h-2 w-24 rounded-full bg-zinc-200 dark:bg-zinc-700 animate-pulse opacity-60" />
          </div>
          <span className="text-xs font-medium text-zinc-400 ml-1">
            Reviewing thread...
          </span>
        </div>
      </div>
    );
  }

  // STATE 3: RESOLVED
  if (suggestion) {
    return (
      <div className="relative w-full max-w-2xl mx-auto my-3 bg-white dark:bg-zinc-950 border border-purple-500/20 rounded-2xl shadow-lg shadow-purple-500/5 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
        {/* animated rainbow bar */}
        <div className="h-0.5 w-full bg-linear-to-r from-blue-500 via-purple-500 to-pink-500 bg-size-[200%] animate-[rainbowSlide_3s_linear_infinite]" />

        <div className="p-4 sm:p-5">
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400">
              <Sparkles
                size={15}
                className="animate-[sparkleSpin_4s_ease-in-out_infinite]"
              />
              <h4 className="text-[10px] font-black uppercase tracking-widest">
                AI Customer Rep Guide
              </h4>
            </div>
            <button
              onClick={onClear}
              className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors bg-zinc-100 dark:bg-zinc-800 rounded-full p-1"
            >
              <X size={13} />
            </button>
          </div>

          {/* typewriter text */}
          <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed mb-4 min-h-5">
            {displayedText}
            {isTyping && (
              <span className="inline-block w-0.5 h-3.25 bg-purple-500 ml-0.5 align-middle animate-[blink_0.8s_step-end_infinite]" />
            )}
          </p>

          {/* buttons — only show after typewriter done, never disappear */}
          {suggestion.contactRequired && !isTyping && (
            <div className="flex flex-wrap gap-2 pt-3 border-t border-zinc-100 dark:border-zinc-800">
              {suggestion.suggestedSms && (
                <button
                  onClick={() => onUseSms(suggestion.suggestedSms!)}
                  className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 text-[11px] font-semibold rounded-lg border border-blue-200 dark:border-blue-500/20 hover:bg-blue-100 dark:hover:bg-blue-500/20 transition-colors"
                >
                  <MessageSquare size={12} />
                  Draft SMS
                  <ArrowRight size={11} className="opacity-50 ml-1" />
                </button>
              )}
              {suggestion.suggestedEmail && (
                <button
                  onClick={() =>
                    onUseEmail(
                      suggestion.suggestedEmail!.subject,
                      suggestion.suggestedEmail!.body,
                    )
                  }
                  className="flex items-center gap-2 px-3 py-1.5 bg-purple-50 dark:bg-purple-500/10 text-purple-700 dark:text-purple-400 text-[11px] font-semibold rounded-lg border border-purple-200 dark:border-purple-500/20 hover:bg-purple-100 dark:hover:bg-purple-500/20 transition-colors"
                >
                  <Mail size={12} />
                  Draft Email
                  <ArrowRight size={11} className="opacity-50 ml-1" />
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  return null;
}
