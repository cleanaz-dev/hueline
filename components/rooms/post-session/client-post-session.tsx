"use client";

import React, { useState } from "react";
import { Sparkles, RefreshCw } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { BookingData, Room } from "@/types/subdomain-type";
import { useBooking } from "@/context/booking-context";
import { getPublicUrl } from "@/lib/aws/cdn";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

// Import separate components
import { ProjectOverview } from "./project-overview";
import { ScopeAnalysis } from "./scope-analysis";
import { FeedbackForm } from "./feedback-form";

interface ClientPostSessionProps {
  data: {
    booking: BookingData;
    room: Room;
  };
  presignedUrls: Record<string, string>;
}

export default function ClientPostSession({
  data,
  presignedUrls,
}: ClientPostSessionProps) {
  const { booking, room } = data;
  const { subdomain } = useBooking();
  const router = useRouter();
  const [isRetrying, setIsRetrying] = useState(false);

  const logoSrc = getPublicUrl(subdomain.logo) || "/placeholder-logo.png";

  const handleRetry = async () => {
    if (isRetrying) return;

    setIsRetrying(true);
    try {
      const response = await fetch(
        `/api/subdomain/${subdomain.slug}/booking/${booking.huelineId}/${room.id}`,
        {
          method: "DELETE",
        },
      );

      const result = await response.json();

      if (result.success) {
        router.push(`/booking/${booking.huelineId}`);
      } else {
        throw new Error(result.error || "Failed to delete scope analysis");
      }
    } catch (error) {
      console.error("Error retrying scope analysis:", error);
      alert("Failed to retry. Please try again.");
      setIsRetrying(false);
    }
  };
  return (
    <div className="min-h-screen bg-zinc-50 font-sans text-zinc-900 pb-20">
      {/* --- 1. THE DREAM --- */}
      <ProjectOverview
        booking={booking}
        logoSrc={logoSrc}
        presignedUrls={presignedUrls}
        onRetry={handleRetry}
        isRetrying={isRetrying}
      />

      {/* --- SEPARATOR --- */}
      <div className="max-w-3xl mx-auto px-6 py-8">
        <div className="flex items-center gap-4">
          <Separator className="flex-1 bg-zinc-200" />
          <div className="flex items-center gap-2 text-zinc-500 bg-white px-4 py-1.5 rounded-full border border-zinc-200 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-purple-600" />
            <span className="text-[11px] font-bold uppercase tracking-widest">
              AI Scope Analysis
            </span>
          </div>
          <Separator className="flex-1 bg-zinc-200" />
        </div>
      </div>

      {/* --- CONTAINER FOR REALITY & FAITH --- */}
      <div className="max-w-3xl mx-auto px-4 md:px-6 space-y-8 animate-in slide-in-from-bottom-4 duration-700">
        {/* --- 2. THE REALITY --- */}
        <ScopeAnalysis room={room} presignedUrls={presignedUrls} />

        {/* --- 3. FAITH --- */}
        <FeedbackForm companyName={subdomain.companyName || "Our Team"} />
      </div>
    </div>
  );
}
