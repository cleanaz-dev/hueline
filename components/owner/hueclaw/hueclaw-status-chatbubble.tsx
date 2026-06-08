"use client";

import useSWR from "swr";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Bot, Loader2, Image as ImageIcon, Calculator, BrainCircuit } from "lucide-react";
import { cn } from "@/lib/utils";
import { useOwner } from "@/context/owner-context";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

interface HueClawStatusBubbleProps {
  threadId: string;
}

export function HueClawStatusBubble({ threadId }: HueClawStatusBubbleProps) {
  const { subdomain } = useOwner()
  // Polls every 2 seconds ONLY when the AI is actively working
  const { data } = useSWR(
    `/api/subdomain/${subdomain.id}/threads/${threadId}/hueclaw-status`,
    fetcher,
    {
      refreshInterval: (latestData) => (latestData?.isWorking ? 2000 : 0),
      revalidateOnFocus: false,
    }
  );

  // If Redis says it's not working, hide the component completely
  if (!data?.isWorking) return null;

  // Map the task type to cool UI states
  const STATUS_CONFIG: Record<string, { text: string; icon: any }> = {
    COMMUNICATION: { text: "HueClaw is analyzing thread...", icon: BrainCircuit },
    IMAGEN: { text: "HueClaw is generating an image...", icon: ImageIcon },
    QUOTE: { text: "HueClaw is calculating a quote...", icon: Calculator },
  };

  const activeStatus = STATUS_CONFIG[data.taskType] || {
    text: "HueClaw is thinking...",
    icon: Loader2,
  };
  
  const StatusIcon = activeStatus.icon;

  return (
    <div className="flex w-full justify-start mb-6 transition-all duration-300">
      <div className="flex max-w-[85%] md:max-w-[95%] flex-row">
        
        {/* Avatar matching your AI config */}
        <div className="flex flex-col items-center shrink-0 w-8 mx-3 mt-0.5">
          <Avatar className="h-8 w-8 shadow-sm border border-zinc-200 dark:border-zinc-700 animate-pulse">
            <AvatarFallback className="bg-background text-indigo-800 dark:text-indigo-400">
              <Bot size={16} />
            </AvatarFallback>
          </Avatar>
        </div>

        <div className="flex flex-col gap-1.5 min-w-0 items-start">
          {/* Header */}
          <div className="flex items-baseline gap-2 px-1">
            <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              HueClaw Agent
            </span>
            <span className="text-[10px] font-medium text-indigo-500 animate-pulse">
              Working...
            </span>
          </div>

          {/* Bubble matching your AI config */}
          <div className="relative flex flex-col px-4 py-3 rounded-2xl rounded-tl-sm text-[14.5px] shadow-sm break-words w-full bg-indigo-50 dark:bg-indigo-500/10 text-indigo-900 dark:text-indigo-200 border border-indigo-100 dark:border-indigo-500/20">
            
            <div className="flex items-center gap-3 opacity-90">
              <StatusIcon 
                size={16} 
                className={cn("text-indigo-500", data.taskType === "COMMUNICATION" ? "animate-pulse" : "animate-bounce")} 
              />
              <span className="font-medium tracking-wide text-sm">
                {activeStatus.text}
              </span>
            </div>
            
          </div>
        </div>
      </div>
    </div>
  );
}