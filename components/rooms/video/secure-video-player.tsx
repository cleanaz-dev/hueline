"use client";

import useSWR from "swr";
import { useOwner } from "@/context/owner-context";
import { Loader2, AlertCircle, Play } from "lucide-react";
import { cn } from "@/lib/utils";

interface SecureVideoPlayerProps {
  roomId: string;
  className?: string;
  // We don't strictly need to pass the S3 key here because the API
  // looks it up from the DB based on roomId. This is more secure.
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function SecureVideoPlayer({ roomId, className }: SecureVideoPlayerProps) {
  const { subdomain } = useOwner();

  // Construct endpoint
  const apiEndpoint = `/api/subdomain/${subdomain.slug}/room/${roomId}/recording`;

  // SWR Config:
  // - revalidateOnFocus: false (don't refresh while watching)
  // - refreshInterval: 14 mins (refresh automatically before the 15m link dies)
  const { data, error, isLoading } = useSWR(apiEndpoint, fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    refreshInterval: 1000 * 60 * 14, // 14 minutes
  });

  // --- LOADING STATE ---
  if (isLoading) {
    return (
      <div className={cn("flex items-center justify-center bg-black/5 aspect-video rounded-lg", className)}>
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
          <span className="text-xs text-zinc-500">Loading secure recording...</span>
        </div>
      </div>
    );
  }

  // --- ERROR STATE ---
  if (error || !data?.url) {
    return (
      <div className={cn("flex items-center justify-center bg-red-50 aspect-video rounded-lg border border-red-100", className)}>
        <div className="flex flex-col items-center gap-2 text-red-500">
          <AlertCircle className="h-6 w-6" />
          <span className="text-xs font-medium">Unable to load recording</span>
        </div>
      </div>
    );
  }

  // --- SUCCESS STATE ---
  return (
    <div className={cn("relative overflow-hidden rounded-lg bg-black shadow-sm", className)}>
      <video
        controls
        className="w-full h-full object-contain"
        poster="/placeholder-video-bg.jpg" // Optional: nice touch
      >
        <source src={data.url} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
    </div>
  );
}