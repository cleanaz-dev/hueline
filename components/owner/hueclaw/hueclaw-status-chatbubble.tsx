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
    IMAGEN: { text: "Generating an image", icon: ImageIcon },
    QUOTE: { text: "Calculating custom quote", icon: Calculator },
    INTELLIGENCE: { text: "Processing call intelligence", icon: Speech },
    OUTBOUND_CALL: { text: "Initiating outbound call", icon: PhoneOutgoing },
    DIALING_OPERATOR: { text: "Dialing operator...", icon: PhoneOutgoing },
    OPERATOR_CONNECTED: { text: "Operator connected, bridging...", icon: Headset },
    DIALING_CUSTOMER: { text: "Dialing customer...", icon: PhoneForwarded },
    CALL_CONNECTED: { text: "Live call in progress", icon: Phone },
    NUDGE: { text: "Processing next steps", icon: Loader2 },
    LIVE_IMAGEN: { text: "Generating a live image", icon: ImageIcon },
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
          initial={{ opacity: 0, y: 10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="flex w-full justify-center my-4"
        >
          {/* AI Dynamic Island Pill */}
          <div className="relative flex items-center gap-3 p-1 pr-4 rounded-full bg-white dark:bg-zinc-900 border border-indigo-100 dark:border-indigo-500/30 shadow-md shadow-indigo-500/5">
            
            {/* AI Avatar inside the pill */}
            <div className="flex items-center justify-center w-7 h-7 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-500 text-white shadow-inner shrink-0 relative overflow-hidden">
              <Bot size={14} className="relative z-10" />
              {/* Subtle sweep effect inside the avatar */}
              <div className="absolute inset-0 bg-white/20 blur-sm animate-pulse" />
            </div>

            {/* Status Icon & Text Group */}
            <div className="flex items-center gap-1.5">
              <StatusIcon
                size={12}
                className={cn(
                  "text-indigo-500 dark:text-indigo-400",
                  data?.taskType && STATUS_CONFIG[data.taskType as HueClawStatus]
                    ? "animate-pulse"
                    : "animate-[spin_3s_linear_infinite]"
                )}
              />
              <span className="text-[12.5px] font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">
                {activeStatus.text}
              </span>
            </div>

            {/* AI Bouncing Dots */}
            <div className="flex gap-0.5 ml-1 opacity-70">
              <motion.span
                animate={{ y: [0, -3, 0] }}
                transition={{ repeat: Infinity, duration: 1, delay: 0 }}
                className="w-1 h-1 bg-purple-500 rounded-full"
              />
              <motion.span
                animate={{ y: [0, -3, 0] }}
                transition={{ repeat: Infinity, duration: 1, delay: 0.15 }}
                className="w-1 h-1 bg-purple-500 rounded-full"
              />
              <motion.span
                animate={{ y: [0, -3, 0] }}
                transition={{ repeat: Infinity, duration: 1, delay: 0.3 }}
                className="w-1 h-1 bg-purple-500 rounded-full"
              />
            </div>

          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}