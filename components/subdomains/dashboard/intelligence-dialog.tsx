"use client";

import useSWR from "swr";
import { useMemo } from "react";
import { X, Building2, Home, TrendingUp, Calendar, Activity } from "lucide-react";
import { BookingData } from "@/types/subdomain-type";
import { Button } from "@/components/ui/button";
import { formatProjectScope, getEstimatedValueRange } from "@/lib/utils/dashboard-utils";
import { useRoomScopes } from "@/hooks/use-room-scopes";
import { useOwner } from "@/context/owner-context";

// Sub-components
import { IntelRoom } from "./intel-room";
import { IntelCall } from "./intel-call";
import { IntelLogs } from "./intel-logs";

interface IntelligenceDialogProps {
  isOpen: boolean;
  onClose: () => void;
  booking: BookingData; 
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function IntelligenceDialog({
  isOpen,
  onClose,
  booking,
}: IntelligenceDialogProps) {
  if (!isOpen) return null;
  const { subdomain } = useOwner();
  const slug = subdomain?.slug || "";

  // 1. Fetch ONLY Logs
  const { data: logs, isLoading: loadingLogs } = useSWR(
    `/api/subdomain/${slug}/booking/${booking.huelineId}/logs`,
    fetcher,
    { revalidateOnFocus: false }
  );

  // 2. Existing Hooks
  const roomId = booking.rooms?.[0]?.roomKey || "";
  const { presignedUrls } = useRoomScopes(slug, roomId);

  // 3. Sort Calls
  const sortedCalls = useMemo(
    () => [...(booking.calls || [])].sort(
        (a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ),
    [booking.calls]
  );

  // 4. Stats & Config
  const totalValue = sortedCalls.reduce((sum: number, c: any) => sum + (c.intelligence?.estimatedAdditionalValue || 0), 0);
  const totalInteractions = (booking.calls?.length || 0) + (booking.rooms?.length || 0);
  const scope = booking.projectScope || "UNKNOWN";
  const type = (booking as any).projectType || "RESIDENTIAL";
  const TypeIcon = type === "COMMERCIAL" ? Building2 : Home;
  
  const hasCalls = sortedCalls.length > 0;
  const hasRooms = booking.rooms && booking.rooms.length > 0;
  const hasLogs = logs && logs.length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" 
        onClick={onClose} 
      />

      {/* 
          MODAL CONTAINER 
          - Mobile Fix: w-[95vw] and max-h-[85dvh]. 
            This ensures it floats like a card and doesn't trigger full-page scrolling.
          - Desktop: sm:h-[85vh] (fixed window look).
      */}
      <div className="relative w-[95vw] max-h-[85dvh] sm:w-full sm:max-w-2xl sm:h-[85vh] bg-white rounded-xl sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* HEADER (Fixed) */}
        <div className="shrink-0 flex items-start justify-between px-5 py-4 sm:px-6 sm:py-5 border-b border-slate-100 bg-white z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">{booking.name}</h3>
              <div className="hidden sm:flex px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200 items-center gap-1 uppercase tracking-wide">
                <TypeIcon className="w-3 h-3" /> {formatProjectScope(scope)}
              </div>
            </div>
            <div className="flex items-center gap-4 text-xs font-medium text-slate-500">
              <span className="flex items-center gap-1.5 bg-slate-50 px-2 py-0.5 rounded border border-slate-100">
                <Activity className="w-3.5 h-3.5 text-indigo-500" />
                {totalInteractions} Interaction{totalInteractions !== 1 && "s"}
              </span>
              {totalValue > 0 && (
                <span className="flex items-center gap-1.5 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                  <TrendingUp className="w-3.5 h-3.5" />
                  +{getEstimatedValueRange(totalValue)} Value
                </span>
              )}
            </div>
          </div>
          <button onClick={onClose} className="p-2 -mr-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* BODY (Scrollable) */}
        <div className="flex-1 overflow-y-auto bg-slate-50/50 p-3 sm:p-6 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
          <div className="max-w-3xl mx-auto space-y-6">
            
            {/* 1. ROOMS */}
            {hasRooms && <IntelRoom rooms={booking.rooms} presignedUrls={presignedUrls} />}

            {/* 2. CALLS */}
            {hasCalls && (
              <div className="space-y-3">
                 {/* Header / Separator */}
                 <div className="flex items-center gap-2 mb-2 px-1">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Communication History</span>
                    <div className="h-px flex-1 bg-slate-200/60" />
                 </div>
                 {sortedCalls.map((call: any) => <IntelCall key={call.id} call={call} />)}
              </div>
            )}
            
            {/* 3. LOGS */}
            {loadingLogs ? (
               <div className="flex justify-center py-6 text-slate-400 text-sm animate-pulse">
                  Loading timeline...
               </div>
            ) : hasLogs ? (
               <div className="space-y-3">
                  {/* NEW Header / Separator */}
                  <div className="flex items-center gap-2 mb-2 px-1 pt-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Related Logs</span>
                    <div className="h-px flex-1 bg-slate-200/60" />
                  </div>
                  
                  <IntelLogs logs={logs} />
               </div>
            ) : null}

            {/* EMPTY STATE */}
            {!hasCalls && !hasRooms && !hasLogs && !loadingLogs && (
              <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4 border border-slate-200">
                  <Calendar className="w-8 h-8 text-slate-300" />
                </div>
                <h4 className="font-semibold text-slate-900">No Data Available</h4>
                <p className="text-sm mt-1 text-slate-500">No activity recorded for this project yet.</p>
              </div>
            )}
          </div>
        </div>

        {/* FOOTER (Fixed) */}
        <div className="shrink-0 p-4 border-t border-slate-100 bg-white flex justify-end">
          <Button variant="outline" onClick={onClose} className="w-full sm:w-auto">Close</Button>
        </div>
      </div>
    </div>
  );
}