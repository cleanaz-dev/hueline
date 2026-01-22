"use client";

import useSWR from "swr";
import { useMemo, useEffect } from "react";
import { 
  X, 
  Building2, 
  Home, 
  TrendingUp, 
  Calendar, 
  Phone, 
  Video, 
  ScrollText, 
  Loader2 
} from "lucide-react"; 
import { BookingData } from "@/types/subdomain-type";
import { formatProjectScope, getEstimatedValueRange } from "@/lib/utils/dashboard-utils";
import { useRoomScopes } from "@/hooks/use-room-scopes";
import { useOwner } from "@/context/owner-context";

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
  const { subdomain } = useOwner();
  const slug = subdomain?.slug || "";

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      const originalPaddingRight = document.body.style.paddingRight;
      
      // Get scrollbar width to prevent layout shift
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      
      document.body.style.overflow = 'hidden';
      if (scrollbarWidth > 0) {
        document.body.style.paddingRight = `${scrollbarWidth}px`;
      }
      
      return () => {
        document.body.style.overflow = originalOverflow;
        document.body.style.paddingRight = originalPaddingRight;
      };
    }
  }, [isOpen]);

  // 1. Fetch Logs (EXCLUDE NOTES)
  const { data: allLogs, isLoading: loadingLogs } = useSWR(
    isOpen ? `/api/subdomain/${slug}/booking/${booking.huelineId}/logs` : null,
    fetcher,
    { revalidateOnFocus: false }
  );

  // 🔥 FILTER OUT NOTES FROM LOGS
  const logs = useMemo(() => 
    allLogs?.filter((log: any) => log.type !== "NOTE") || [],
    [allLogs]
  );

  // 2. Fetch Rooms
  const roomId = booking.rooms?.[0]?.roomKey || "";
  const { presignedUrls } = useRoomScopes(slug, roomId);

  // 3. Sort Calls
  const sortedCalls = useMemo(
    () => [...(booking.calls || [])].sort(
        (a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ),
    [booking.calls]
  );

  // --- STATS CALCULATION ---
  const totalValue = sortedCalls.reduce((sum: number, c: any) => sum + (c.intelligence?.estimatedAdditionalValue || 0), 0);
  
  // Specific Counts
  const callCount = sortedCalls.length;
  const roomCount = booking.rooms?.length || 0;
  const logCount = logs?.length || 0;

  const scope = booking.projectScope || "UNKNOWN";
  const type = (booking as any).projectType || "RESIDENTIAL";
  const TypeIcon = type === "COMMERCIAL" ? Building2 : Home;
  
  const hasCalls = callCount > 0;
  const hasRooms = roomCount > 0;
  const hasLogs = logCount > 0;

  // Early return AFTER all hooks
  if (!isOpen) return null;

  return (
    // WRAPPER: 
    // - Mobile: items-end (slide up feel), no padding
    // - Desktop: items-center, p-4
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 animate-in fade-in duration-200">
      
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />

      {/* MODAL CONTAINER: 
          - Mobile: w-full h-full (Full Screen), rounded-none
          - Desktop: max-w-2xl, h-[85vh], rounded-2xl
          - Animation: Slide up on mobile, Zoom on desktop
      */}
      <div className="relative w-full h-full sm:w-full sm:max-w-2xl sm:h-[85vh] bg-white sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-10 sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-200">
        
        {/* HEADER */}
        <div className="shrink-0 flex items-center justify-between px-5 py-4 sm:px-6 sm:py-5 border-b border-slate-100 bg-white z-10 safe-area-top">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">{booking.name}</h3>
              <div className="hidden sm:flex px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200 items-center gap-1 uppercase tracking-wide">
                <TypeIcon className="w-3 h-3" /> {formatProjectScope(scope)}
              </div>
            </div>

            {/* --- STATUS BAR --- */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-medium text-slate-500">
              
              {/* Calls */}
              <div className="flex items-center gap-1.5" title="Recorded Calls">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                <span>{callCount} Call{callCount !== 1 && "s"}</span>
              </div>

              {/* Rooms */}
              <div className="flex items-center gap-1.5" title="Site Survey Rooms">
                <Video className="w-3.5 h-3.5 text-slate-400" />
                <span>{roomCount} Room{roomCount !== 1 && "s"}</span>
              </div>

              {/* Logs */}
              <div className="flex items-center gap-1.5 min-w-[60px]" title="Activity Logs">
                <ScrollText className="w-3.5 h-3.5 text-slate-400" />
                {loadingLogs ? (
                  <span className="flex items-center gap-1 text-slate-400">
                     <Loader2 className="w-3 h-3 animate-spin" /> ...
                  </span>
                ) : (
                  <span>{logCount} Log{logCount !== 1 && "s"}</span>
                )}
              </div>

              {/* Value Separator & Badge */}
              {totalValue > 0 && (
                 <>
                  <div className="w-px h-3 bg-slate-200 mx-1 hidden sm:block" />
                  <span className="flex items-center gap-1 text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100/50">
                    <TrendingUp className="w-3 h-3" />+{getEstimatedValueRange(totalValue)}
                  </span>
                </>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
             <button onClick={onClose} className="cursor-pointer p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-full transition-colors active:scale-90">
               <X className="w-6 h-6 sm:w-5 sm:h-5" />
             </button>
          </div>
        </div>

        {/* BODY */}
        <div className="flex-1 overflow-y-auto bg-slate-50/50 p-4 sm:p-6 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
          <div className="max-w-3xl mx-auto space-y-4 pb-10 sm:pb-0">
            
            {/* 1. SITE SURVEY (Rooms) */}
            {hasRooms && (
               <IntelRoom 
                  rooms={booking.rooms} 
                  presignedUrls={presignedUrls} 
                  defaultExpanded={true} // Expanded by default on mobile full view
               />
            )}

            {/* 2. CALLS */}
            {hasCalls && (
              <div className="space-y-3 pt-2">
                 <div className="flex items-center gap-2 mb-2 px-1">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Calls & Audio</span>
                    <div className="h-px flex-1 bg-slate-200/60" />
                 </div>
                 {sortedCalls.map((call: any) => <IntelCall key={call.id} call={call} />)}
              </div>
            )}

            {/* 3. ACTIVITY HISTORY (Logs - No Notes) */}
            {(hasLogs || loadingLogs) && (
               <div className="space-y-3 pt-2">
                  <div className="flex items-center gap-2 mb-2 px-1">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Activity History</span>
                    <div className="h-px flex-1 bg-slate-200/60" />
                 </div>
                  <IntelLogs 
                    logs={logs || []} 
                    defaultExpanded={true} 
                    loading={loadingLogs} 
                  />
               </div>
            )}

            {/* EMPTY STATE */}
            {!hasCalls && !hasRooms && !hasLogs && !loadingLogs && (
              <div className="flex flex-col items-center justify-center py-20 sm:py-16 text-slate-400">
                <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4 border border-slate-200">
                  <Calendar className="w-8 h-8 text-slate-300" />
                </div>
                <h4 className="font-semibold text-slate-900">No Activity Yet</h4>
                <p className="text-sm mt-1 text-slate-500">No calls or activity recorded for this project.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}