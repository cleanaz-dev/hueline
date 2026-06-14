// hueclaw-chat-controls.tsx
import { useState, useEffect } from "react";
import { Sparkles, Timer, Loader2 } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { useOwner } from "@/context/owner-context";

interface HueClawControlsProps {
  isAutoPilot?: boolean;
  setIsAutoPilot: (val: boolean) => void;
  onNudge: () => void;
  isAiLoading?: boolean;
  customerId?: string;
  threadId?: string;
}

export function HueClawChatControls({
  isAutoPilot,
  setIsAutoPilot,
  onNudge,
  isAiLoading,
  customerId,
  threadId,
}: HueClawControlsProps) {
  const [countdown, setCountdown] = useState<number | null>(null);
  const [isToggling, setIsToggling] = useState<boolean>(false);

  // 👈 1. Grab refreshThreads from Context
  const { subdomain, refreshThreads } = useOwner();

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isAutoPilot && countdown !== null && countdown > 0) {
      timer = setTimeout(() => setCountdown((c) => c! - 1), 1000);
    } else if (isAutoPilot && countdown === 0) {
      setCountdown(null);
    }
    return () => clearTimeout(timer);
  }, [isAutoPilot, countdown]);

  const handleToggle = async (checked: boolean) => {
    // Optimistic UI Update
    setIsAutoPilot(checked);
    if (checked) setCountdown(5);
    else setCountdown(null);

    if (!threadId || !subdomain?.slug) return;

    setIsToggling(true);
    try {
      await axios.put(
        `/api/subdomain/${subdomain.slug}/threads/${threadId}/auto-pilot`,
        {
          data: {
            customerId,
            isAutoPilot: checked,
          },
        },
      );

      // 👈 2. Fire refreshThreads so your sidebar list gets the updated AutoPilot state in the background!
      refreshThreads();
    } catch (error) {
      console.error("Failed to update autopilot status:", error);
      setIsAutoPilot(!checked); // Revert UI if backend fails
      setCountdown(null);
    } finally {
      setIsToggling(false);
    }
  };

  const handleManualNudge = () => {
    setCountdown(null);
    onNudge();
  };

  return (
    <div className="flex h-9 items-center gap-3 bg-violet-50/40 dark:bg-violet-950/20 p-1 pl-3 rounded-lg border border-violet-100 dark:border-violet-900/40 shadow-sm transition-all duration-300">
      {/* 1. Toggle Area */}
      <div className="flex items-center gap-2 w-[105px]">
        <Switch
          checked={isAutoPilot}
          onCheckedChange={handleToggle} // Fixed: Just pass the function reference directly
          disabled={isToggling} // Prevents spam-clicking the API
          className="data-[state=checked]:bg-violet-600 scale-90 m-0"
        />
        <span
          className={cn(
            "text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1",
            isAutoPilot
              ? "text-violet-700 dark:text-violet-300"
              : "text-muted-foreground",
          )}
        >
          Auto {isAutoPilot ? "ON" : "OFF"}
          {/* Optional: Tiny spinner if the API is slow, just so they know it's saving */}
          {isToggling && (
            <Loader2
              size={10}
              className="animate-spin text-muted-foreground ml-1"
            />
          )}
        </span>
      </div>

      <div className="w-[1px] h-4 bg-violet-200 dark:bg-violet-800/60" />

      {/* 2. Action Area */}
      <div className="w-[125px] flex justify-end overflow-hidden relative h-7">
        <AnimatePresence mode="wait">
          {!isAutoPilot ? (
            // STATE 1: OFF
            <motion.button
              key="wake"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              onClick={handleManualNudge}
              disabled={isAiLoading}
              className="absolute inset-0 flex items-center justify-center gap-1.5 rounded-md text-xs font-medium transition-all bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 active:scale-95"
            >
              <Sparkles
                size={13}
                className={cn(!isAiLoading && "text-violet-500")}
              />
              <span>Wake HueClaw</span>
            </motion.button>
          ) : countdown !== null ? (
            // STATE 2: ON + TIMER
            <motion.button
              key="nudge"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2 }}
              onClick={handleManualNudge}
              disabled={isAiLoading}
              className="absolute inset-0 flex items-center justify-center gap-1.5 rounded-md text-xs font-medium transition-all bg-violet-600 text-white border border-violet-600 hover:bg-violet-700 hover:shadow-[0_0_12px_rgba(139,92,246,0.4)] active:scale-95"
            >
              <Timer size={13} className="animate-pulse" />
              <span>Nudge ({countdown}s)</span>
            </motion.button>
          ) : (
            // STATE 3: ON + EXPIRED
            <motion.div
              key="dormant"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0 flex items-center justify-center gap-1.5"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-violet-500"></span>
              </span>
              <span className="text-[10px] font-bold tracking-wider text-violet-500/80">
                LISTENING
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
