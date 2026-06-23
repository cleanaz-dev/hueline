"use client";

import { useEffect, useState } from "react";
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
  ClipboardList,
  PhoneOff,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useOwner } from "@/context/owner-context";
import { HueClawStatus } from "@/lib/redis";
import { pusherClient } from "@/lib/pusher/pusher-client"; 

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

  // Local state to drive the UI instantly
  const [activeData, setActiveData] = useState<{
    isWorking: boolean;
    taskType: HueClawStatus | null;
  }>({
    isWorking: false,
    taskType: null,
  });

  // 1. Fetch INITIAL state exactly ONCE. No more 2-second polling!
  const { data: initialData, mutate } = useSWR(
    `/api/subdomain/${subdomain.slug}/threads/${threadId}/hueclaw-status`,
    fetcher,
    {
      revalidateOnFocus: false, // Optional: Stop fetching when switching tabs
    },
  );

  // 2. Sync initial SWR fetch into local state
  useEffect(() => {
    if (initialData) {
      setActiveData(initialData);
    }
  }, [initialData]);

  // 3. Listen to Pusher for real-time WebSocket updates
  useEffect(() => {
    const channelName = `thread-${threadId}`;
    const channel = pusherClient.subscribe(channelName);

    channel.bind(
      "status-update",
      (data: { isWorking: boolean; taskType: HueClawStatus | null }) => {
        // Update the UI instantly
        setActiveData(data);
        // Silently update SWR's cache so it stays synced
        mutate(data, false);
      },
    );

    // Cleanup subscription on unmount
    return () => {
      pusherClient.unsubscribe(channelName);
    };
  }, [threadId, mutate]);

  const STATUS_CONFIG: Record<HueClawStatus, { text: string; icon: any }> = {
    COMMUNICATION: { text: "AI analyzing thread context", icon: BrainCircuit },
    IMAGEN: { text: "AI generating image", icon: ImageIcon },
    QUOTE: { text: "AI calculating custom quote", icon: Calculator },
    INTELLIGENCE: { text: "AI running intelligence", icon: Speech },
    NUDGE: { text: "AI processing", icon: Loader2 },
    LIVE_IMAGEN: { text: "AI generating live image", icon: ImageIcon },
    OUTBOUND_CALL: { text: "AI initiating outbound call", icon: PhoneOutgoing },
    DIALING_OPERATOR: { text: "Dialing operator", icon: PhoneOutgoing },
    OPERATOR_CONNECTED: { text: "Operator connected", icon: Headset },
    DIALING_CUSTOMER: { text: "AI dialing the customer", icon: PhoneForwarded },
    CALL_CONNECTED: { text: "Call Connected", icon: Phone },
    GATHERING_DETAILS: { text: "AI gathering details", icon: ClipboardList },
    SPEAKING_WITH_CLIENT: { text: "AI speaking with client", icon: Speech },
    CALL_WRAPPING: { text: "AI wrapping up the call", icon: PhoneOff },
  };

  const activeStatus =
    activeData.taskType && STATUS_CONFIG[activeData.taskType]
      ? STATUS_CONFIG[activeData.taskType]
      : { text: "HueClaw is thinking", icon: Loader2 };

  const StatusIcon = activeStatus.icon;

  return (
    <AnimatePresence>
      {activeData.isWorking && (
        <motion.div
          initial={{ opacity: 0, y: 15, scale: 0.9, filter: "blur(4px)" }}
          animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
          exit={{
            opacity: 0,
            y: 10,
            scale: 0.95,
            filter: "blur(2px)",
            transition: { duration: 0.2 },
          }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="flex w-full justify-center my-6 relative z-10"
        >
          <div className="flex items-center gap-3 py-2 px-4 rounded-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm">
            <div className="flex items-center justify-center w-6 h-6 rounded-full bg-zinc-50 dark:bg-zinc-800 text-muted-foreground dark:text-zinc-500 shrink-0">
              <Bot size={13} />
            </div>

            <div className="flex items-center gap-1.5">
              <StatusIcon
                size={13}
                className={cn(
                  "text-zinc-400 dark:text-zinc-500",
                  activeData.taskType &&
                    STATUS_CONFIG[activeData.taskType as HueClawStatus]
                    ? "animate-pulse"
                    : "animate-[spin_3s_linear_infinite]",
                )}
              />
              <span className="text-[13px] font-medium tracking-tight text-muted-foreground/90">
                {activeStatus.text}
              </span>
            </div>

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
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
