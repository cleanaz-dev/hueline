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
    COMMUNICATION: { text: "HueClaw is analyzing thread", icon: BrainCircuit },
    IMAGEN: { text: "HueClaw is generating an image", icon: ImageIcon },
    QUOTE: { text: "HueClaw is calculating a quote", icon: Calculator },
    INTELLIGENCE: {
      text: "HueClaw is processing call intelligence",
      icon: Speech,
    },
    OUTBOUND_CALL: { text: "HueClaw is initiating call", icon: PhoneOutgoing },
    DIALING_OPERATOR: { text: "Dialing operator...", icon: PhoneOutgoing },
    OPERATOR_CONNECTED: {
      text: "Operator connected, bridging...",
      icon: Headset,
    },
    DIALING_CUSTOMER: { text: "Dialing customer...", icon: PhoneForwarded },
    CALL_CONNECTED: { text: "Call in progress", icon: Phone },
    NUDGE: { text: "HueClaw is thinking", icon: Loader2 },
    LIVE_IMAGEN: {
      text: "HueClaw is generating a live image",
      icon: ImageIcon,
    },
  };

  const activeStatus = STATUS_CONFIG[data?.taskType as HueClawStatus] || {
    text: "HueClaw is processing",
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
          className="flex w-full justify-center my-4" // Centered wrapper
        >
          {/* Sleek, centered pill design */}
          <div className="flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-indigo-50/80 dark:bg-indigo-500/10 border border-indigo-100/50 dark:border-indigo-500/20 shadow-sm backdrop-blur-sm text-indigo-700 dark:text-indigo-300">
            
            {/* Pulsing/Spinning Icon */}
            <StatusIcon
              size={14}
              className={cn(
                "text-indigo-500 dark:text-indigo-400",
                data?.taskType && STATUS_CONFIG[data.taskType as HueClawStatus]
                  ? "animate-pulse"
                  : "animate-[spin_3s_linear_infinite]"
              )}
            />

            {/* Status Text */}
            <span className="text-[12px] font-semibold tracking-wide">
              {activeStatus.text}
            </span>

            {/* Subtle trailing dots instead of bouncing balls */}
            <span className="flex gap-0.5 ml-1 opacity-60">
              <span className="w-1 h-1 rounded-full bg-current animate-pulse" style={{ animationDelay: "0ms" }} />
              <span className="w-1 h-1 rounded-full bg-current animate-pulse" style={{ animationDelay: "150ms" }} />
              <span className="w-1 h-1 rounded-full bg-current animate-pulse" style={{ animationDelay: "300ms" }} />
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}