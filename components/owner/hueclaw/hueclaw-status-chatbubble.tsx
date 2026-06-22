"use client";

import useSWR from "swr";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bot,
  Loader2,
  Image as ImageIcon,
  Calculator,
  BrainCircuit,
  Speech,
  PhoneOutgoing,
  Headset,
  PhoneForwarded,
  Phone,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useOwner } from "@/context/owner-context";
import { HueClawStatus } from "@/lib/redis";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

interface HueClawStatusBubbleProps {
  threadId: string;
  isAutoPilot?: boolean;
}

export function HueClawStatusBubble({
  threadId,
  isAutoPilot,
}: HueClawStatusBubbleProps) {
  const { subdomain } = useOwner();

  const { data } = useSWR(
    `/api/subdomain/${subdomain.slug}/threads/${threadId}/hueclaw-status`,
    fetcher,
    {
      refreshInterval: (latestData) => {
        return isAutoPilot || latestData?.isWorking ? 2000 : 0;
      },
      revalidateOnFocus: true,
    },
  );

  const STATUS_CONFIG: Record<HueClawStatus, { text: string; icon: any }> = {
    COMMUNICATION: { text: "Analyzing thread context", icon: BrainCircuit },
    IMAGEN: { text: "Generating image", icon: ImageIcon },
    QUOTE: { text: "Calculating custom quote", icon: Calculator },
    INTELLIGENCE: { text: "Processing intelligence", icon: Speech },
    OUTBOUND_CALL: { text: "Initiating call", icon: PhoneOutgoing },
    DIALING_OPERATOR: { text: "Dialing operator...", icon: PhoneOutgoing },
    OPERATOR_CONNECTED: { text: "Operator connected", icon: Headset },
    DIALING_CUSTOMER: { text: "Dialing customer...", icon: PhoneForwarded },
    CALL_CONNECTED: { text: "Live call in progress", icon: Phone },
    NUDGE: { text: "Processing", icon: Loader2 },
    LIVE_IMAGEN: { text: "Generating live image", icon: ImageIcon },
  };

  const activeStatus = STATUS_CONFIG[data?.taskType as HueClawStatus] || {
    text: "HueClaw is thinking",
    icon: Loader2,
  };

  const StatusIcon = activeStatus.icon;

  return (
    <AnimatePresence>
      {data?.isWorking && (
        <motion.div
          // Spring physics for a realistic "popping out" feeling
          initial={{ opacity: 0, y: 15, scale: 0.9, filter: "blur(4px)" }}
          animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
          exit={{ opacity: 0, y: 10, scale: 0.95, filter: "blur(2px)", transition: { duration: 0.2 } }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="flex w-full justify-center my-6 relative z-10"
        >
          {/* Continuous "breathing" / hovering effect */}
          <motion.div 
            animate={{ y: [0, -2, 0] }} 
            transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
            // The ultra-soft shadow creates the physical depth
            className="flex items-center gap-3 py-2 px-4 rounded-full bg-white dark:bg-zinc-900 shadow-[0_8px_30px_rgb(0,0,0,0.08)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.4)] border border-black/5 dark:border-white/5"
          >
            
            {/* Minimal AI Avatar */}
            <div className="flex items-center justify-center w-6 h-6 rounded-full bg-zinc-50 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-500 shrink-0">
              <Bot size={13} />
            </div>

            {/* Status Info (Grayscale/Muted) */}
            <div className="flex items-center gap-1.5">
              <StatusIcon
                size={13}
                className={cn(
                  "text-zinc-400 dark:text-zinc-500",
                  data?.taskType && STATUS_CONFIG[data.taskType as HueClawStatus]
                    ? "animate-pulse"
                    : "animate-[spin_3s_linear_infinite]"
                )}
              />
              <span className="text-[13px] font-medium tracking-tight text-zinc-600 dark:text-zinc-300">
                {activeStatus.text}
              </span>
            </div>

            {/* Subtle Breathing Dots */}
            <div className="flex gap-1 ml-1 items-center">
              <motion.div
                animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1, 0.8] }}
                transition={{ repeat: Infinity, duration: 1.5, delay: 0 }}
                className="w-1 h-1 bg-zinc-400 dark:bg-zinc-500 rounded-full"
              />
              <motion.div
                animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1, 0.8] }}
                transition={{ repeat: Infinity, duration: 1.5, delay: 0.2 }}
                className="w-1 h-1 bg-zinc-400 dark:bg-zinc-500 rounded-full"
              />
              <motion.div
                animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1, 0.8] }}
                transition={{ repeat: Infinity, duration: 1.5, delay: 0.4 }}
                className="w-1 h-1 bg-zinc-400 dark:bg-zinc-500 rounded-full"
              />
            </div>

          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}