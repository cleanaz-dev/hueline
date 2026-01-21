"use client";

import useSWR from "swr";
import { useMemo, useState } from "react";
import { X, Building2, Home, TrendingUp, Calendar, Activity, PenSquare } from "lucide-react";
import { BookingData } from "@/types/subdomain-type";
import { Button } from "@/components/ui/button";
import { formatProjectScope, getEstimatedValueRange } from "@/lib/utils/dashboard-utils";
import { useRoomScopes } from "@/hooks/use-room-scopes";
import { useOwner } from "@/context/owner-context";

import { IntelRoom } from "./intel-room";
import { IntelCall } from "./intel-call";
import { IntelLogs } from "./intel-logs";
import { IntelAddNote } from "./intel-add-note";

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
  const [showNoteInput, setShowNoteInput] = useState(false);

  // 1. Fetch Logs (Lightweight)
  const { data: logs, isLoading: loadingLogs } = useSWR(
    `/api/subdomain/${slug}/booking/${booking.huelineId}/logs`,
    fetcher,
    { revalidateOnFocus: false }
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

  // Stats
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
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-[95vw] h-[85dvh] sm:w-full sm:max-w-2xl sm:h-[85vh] bg-white rounded-xl sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* HEADER */}
        <div className="shrink-0 flex items-center justify-between px-5 py-4 sm:px-6 sm:py-5 border-b border-slate-100 bg-white z-10">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <h3 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">{booking.name}</h3>
              <div className="hidden sm:flex px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200 items-center gap-1 uppercase tracking-wide">
                <TypeIcon className="w-3 h-3" /> {formatProjectScope(scope)}
              </div>
            </div>
            <div className="flex items-center gap-3 text-xs font-medium text-slate-500">
              <span className="flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-indigo-500" />
                {totalInteractions} Event{totalInteractions !== 1 && "s"}
              </span>
              {totalValue > 0 && (
                 <span className="flex items-center gap-1 text-emerald-600">
                  <TrendingUp className="w-3.5 h-3.5" />+{getEstimatedValueRange(totalValue)}
                </span>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
             {/* Note Button */}
             <Button
                variant={showNoteInput ? "secondary" : "outline"}
                size="sm"
                onClick={() => setShowNoteInput(!showNoteInput)}
                className="hidden sm:flex h-8 gap-2 text-xs font-semibold"
             >
                <PenSquare className="w-3.5 h-3.5" />
                Add Note
             </Button>
             {/* Mobile Icon Button */}
             <Button
                variant={showNoteInput ? "secondary" : "outline"}
                size="icon"
                onClick={() => setShowNoteInput(!showNoteInput)}
                className="sm:hidden h-9 w-9"
             >
                <PenSquare className="w-4 h-4" />
             </Button>

             <div className="h-6 w-px bg-slate-200 mx-1" />

             <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-full transition-colors">
               <X className="w-5 h-5" />
             </button>
          </div>
        </div>

        {/* NOTE INPUT (Slides down) */}
        {showNoteInput && (
            <IntelAddNote 
                huelineId={booking.huelineId} 
                slug={slug} 
                onCancel={() => setShowNoteInput(false)} 
            />
        )}

        {/* BODY */}
        <div className="flex-1 overflow-y-auto bg-slate-50/50 p-3 sm:p-6 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
          <div className="max-w-3xl mx-auto space-y-4">
            
            {/* 1. LOGS & NOTES */}
            {(hasLogs || loadingLogs) && (
               <div>
                  {/* Pass defaultExpanded={false} to keep it clean */}
                  <IntelLogs logs={logs || []} defaultExpanded={false} />
               </div>
            )}

            {/* 2. SITE SURVEY (Rooms) */}
            {hasRooms && (
               <IntelRoom 
                  rooms={booking.rooms} 
                  presignedUrls={presignedUrls} 
                  defaultExpanded={false} // Force clean start
               />
            )}

            {/* 3. CALLS */}
            {hasCalls && (
              <div className="space-y-3 pt-2">
                 <div className="flex items-center gap-2 mb-2 px-1">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Calls & Audio</span>
                    <div className="h-px flex-1 bg-slate-200/60" />
                 </div>
                 {sortedCalls.map((call: any) => <IntelCall key={call.id} call={call} />)}
              </div>
            )}

            {/* EMPTY STATE */}
            {!hasCalls && !hasRooms && !hasLogs && !loadingLogs && !showNoteInput && (
              <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4 border border-slate-200">
                  <Calendar className="w-8 h-8 text-slate-300" />
                </div>
                <h4 className="font-semibold text-slate-900">No Activity Yet</h4>
                <p className="text-sm mt-1 text-slate-500">Start by adding a note or waiting for a call.</p>
                <Button variant="link" onClick={() => setShowNoteInput(true)} className="mt-2 text-indigo-600">
                    Write first note
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}