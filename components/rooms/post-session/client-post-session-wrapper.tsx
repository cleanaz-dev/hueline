"use client";

import useSWR from "swr";
import { Loader2 } from "lucide-react";
import ClientPostSession from "./client-post-session";
import { useBooking } from "@/context/booking-context";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function ClientPostSessionWrapper({ 
  huelineId, 
  roomId, 
  initialData 
}: { 
  huelineId: string; 
  roomId: string; 
  initialData: any 
}) {
  
  const isInitiallyReady = initialData?.room?.status === "COMPLETED";
  const { subdomain } = useBooking()

  const { data, error } = useSWR(
    isInitiallyReady ? null : `/api/subdomain/${subdomain.slug}/booking/${huelineId}/${roomId}/post-session`, 
    fetcher, 
    { 
      fallbackData: initialData,
      refreshInterval: (latestData) => {
        return latestData?.room?.status === "COMPLETED" ? 0 : 2000;
      }
    }
  );

  const sessionData = data || initialData;
  const isReady = sessionData?.room?.isProcessing === false
  console.log("session data", sessionData)
  if (!isReady) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-50 space-y-4">
        <div className="relative">
          <div className="absolute inset-0 bg-purple-500/20 blur-xl rounded-full animate-pulse" />
          <Loader2 className="w-12 h-12 text-purple-600 animate-spin relative z-10" />
        </div>
        <div className="text-center space-y-1">
          <h2 className="text-xl font-bold text-zinc-900">Finalizing AI Scope...</h2>
          <p className="text-zinc-500 text-sm">Organizing photos and calculating counts.</p>
        </div>
      </div>
    );
  }

  return <ClientPostSession data={sessionData} presignedUrls={sessionData.presignedUrls || {}} />;
}