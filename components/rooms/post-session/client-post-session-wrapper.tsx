"use client";

import useSWR from "swr";
import { Loader2 } from "lucide-react";

import { useEffect, useState } from "react";
import ClientPostSession from "./client-post-session";
import { useBooking } from "@/context/booking-context";

// Standard fetcher
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
  
  // 1. Determine if we need to poll
  // If initialData says "COMPLETED", we don't need to poll at all.
  const isInitiallyReady = initialData?.status === "COMPLETED";
  const { subdomain } = useBooking()

  // 2. Setup SWR
  // Only fetch if NOT ready. 
  // refreshInterval: 3000 = Poll every 3 seconds
  const { data, error } = useSWR(
    isInitiallyReady ? null : `/api/subdomain/${subdomain.slug}/booking/${huelineId}/${roomId}`, 
    fetcher, 
    { 
      fallbackData: initialData,
      refreshInterval: (latestData) => {
        // Stop polling if status becomes COMPLETED
        return latestData?.status === "COMPLETED" ? 0 : 2000;
      }
    }
  );

  // 3. Logic: Are we ready?
  const sessionData = data || initialData;
  const isReady = sessionData?.status === "COMPLETED";

  // --- VIEW A: LOADING / AI PROCESSING ---
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

  // --- VIEW B: THE DASHBOARD (Success) ---
  return <ClientPostSession  />;
}