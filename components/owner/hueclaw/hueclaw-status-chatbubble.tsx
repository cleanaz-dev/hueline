"use client";

import useSWR from "swr";
import { Loader2 } from "lucide-react";

// Standard fetcher
const fetcher = (url: string) => fetch(url).then(r => r.json());

export function HueClawStatusBubble({ threadId }: { threadId: string }) {
  const { data, error } = useSWR(
    `/api/threads/${threadId}/hueclaw-status`,
    fetcher,
    { 
      // Magic here: poll every 2s ONLY if the AI is actively working
      refreshInterval: (latestData) => (latestData?.isWorking ? 2000 : 0),
      revalidateOnFocus: false
    }
  );

  // If it's not working, render nothing
  if (!data?.isWorking) return null;

  const statusMap: Record<string, { text: string; color: string }> = {
    COMMUNICATION: { text: "HueClaw is typing...", color: "text-blue-500" },
    IMAGEN: { text: "HueClaw is painting a mockup...", color: "text-purple-500" },
    QUOTE: { text: "HueClaw is calculating a quote...", color: "text-green-500" },
  };

  const currentStatus = statusMap[data.taskType] || { text: "HueClaw is thinking...", color: "text-gray-500" };

  return (
    <div className="flex items-center space-x-3 p-3 bg-white dark:bg-zinc-900 rounded-xl w-fit shadow-sm border border-gray-100 dark:border-zinc-800 transition-all duration-300">
      <div className={`p-1.5 rounded-full bg-gray-100 dark:bg-black ${currentStatus.color}`}>
        <Loader2 className="w-4 h-4 animate-spin" />
      </div>
      <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
        {currentStatus.text}
      </span>
    </div>
  );
}