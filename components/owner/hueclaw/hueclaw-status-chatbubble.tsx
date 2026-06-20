"use client";

import useSWR from "swr";
import { motion, AnimatePresence } from "framer-motion";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Bot,
  Loader2,
  Image as ImageIcon,
  Calculator,
  BrainCircuit,
  Speech,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useOwner } from "@/context/owner-context";

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
      // Because this hits Redis and not Postgres, we can safely poll every 2 seconds
      // as long as AutoPilot is ON, or if the AI is actively working (from a manual trigger)
      refreshInterval: (latestData) => {
        return isAutoPilot || latestData?.isWorking ? 2000 : 0;
      },
      revalidateOnFocus: true,
    },
  );

  const STATUS_CONFIG: Record<string, { text: string; icon: any }> = {
    COMMUNICATION: { text: "HueClaw is analyzing thread", icon: BrainCircuit },
    IMAGEN: { text: "HueClaw is generating an image", icon: ImageIcon },
    QUOTE: { text: "HueClaw is calculating a quote", icon: Calculator },
    INTELLIGENCE: {
      text: "HueClaw is processing call intelligence",
      icon: Speech,
    },
  };

  const activeStatus = STATUS_CONFIG[data?.taskType] || {
    text: "HueClaw is thinking",
    icon: Loader2,
  };

  const StatusIcon = activeStatus.icon;

  return (
    <AnimatePresence>
      {data?.isWorking && (
        <motion.div
          initial={{ opacity: 0, y: 10, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, scale: 0.96, transition: { duration: 0.2 } }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="flex w-full justify-start mb-4 origin-bottom-left"
        >
          <div className="flex max-w-[85%] md:max-w-[95%] flex-row items-end gap-2 px-1">
            <div className="flex flex-col items-center shrink-0 w-6 h-6 mb-0.5 mx-2">
              <Avatar className="h-6 w-6 shadow-sm border border-indigo-100 dark:border-indigo-800/50">
                <AvatarFallback className="bg-indigo-50 dark:bg-indigo-950/50 text-indigo-500 dark:text-indigo-400">
                  <Bot size={12} />
                </AvatarFallback>
              </Avatar>
            </div>

            <div className="flex flex-col gap-1 min-w-0 items-start">
              <div className="relative flex items-center gap-2.5 px-3.5 py-2 rounded-2xl rounded-bl-sm text-[13px] shadow-sm bg-gradient-to-r from-indigo-50 to-white dark:from-indigo-500/10 dark:to-transparent border border-indigo-50/50 dark:border-indigo-500/10 text-indigo-800 dark:text-indigo-300">
                <StatusIcon
                  size={14}
                  className={cn(
                    "text-indigo-400 dark:text-indigo-500",
                    data?.taskType === "COMMUNICATION"
                      ? "animate-pulse"
                      : "animate-[spin_3s_linear_infinite]",
                  )}
                />

                <span className="font-medium tracking-wide opacity-90">
                  {activeStatus.text}
                </span>

                <span className="flex gap-0.5 ml-0.5 opacity-70">
                  <motion.span
                    animate={{ opacity: [0.2, 1, 0.2] }}
                    transition={{ repeat: Infinity, duration: 1.4, delay: 0 }}
                    className="w-1 h-1 bg-indigo-400 rounded-full"
                  />
                  <motion.span
                    animate={{ opacity: [0.2, 1, 0.2] }}
                    transition={{ repeat: Infinity, duration: 1.4, delay: 0.2 }}
                    className="w-1 h-1 bg-indigo-400 rounded-full"
                  />
                  <motion.span
                    animate={{ opacity: [0.2, 1, 0.2] }}
                    transition={{ repeat: Infinity, duration: 1.4, delay: 0.4 }}
                    className="w-1 h-1 bg-indigo-400 rounded-full"
                  />
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
