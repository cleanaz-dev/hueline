"use client";

import React from "react";
import { Sparkles } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { BookingData, Room } from "@/types/subdomain-type";
import { useBooking } from "@/context/booking-context";
import { getPublicUrl } from "@/lib/aws/cdn";

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
  const logoSrc = getPublicUrl(subdomain.logo) || "/placeholder-logo.png";

  return (
    <div className="min-h-screen bg-zinc-50 font-sans text-zinc-900 pb-20">
      
      {/* --- 1. THE DREAM --- */}
      <ProjectOverview 
        booking={booking} 
        logoSrc={logoSrc} 
        presignedUrls={presignedUrls} 
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
        <ScopeAnalysis 
          room={room} 
          presignedUrls={presignedUrls} 
        />

        {/* --- 3. FAITH --- */}
        <FeedbackForm 
          // Fix: Provide a fallback string in case companyName is null
          companyName={subdomain.companyName || "Our Team"} 
        />
        
      </div>
    </div>
  );
}