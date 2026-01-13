"use client";

import { useMemo } from "react";
import { X, Clock, Home, Building2, TrendingUp, Calendar } from "lucide-react";
import { BookingData } from "@/types/subdomain-type";
import { Button } from "@/components/ui/button";
import {
  formatProjectScope,
  getEstimatedValueRange,
} from "@/lib/utils/dashboard-utils";
import { useRoomScopes } from "@/hooks/use-room-scopes";

// Sub-components
import { IntelRoom } from "./intel-room";
import { IntelCall } from "./intel-call";
import { useOwner } from "@/context/owner-context";

interface IntelligenceDialogProps {
  isOpen: boolean;
  onClose: () => void;
  booking: BookingData & { rooms?: any[] };
}

export default function IntelligenceDialog({
  isOpen,
  onClose,
  booking,
}: IntelligenceDialogProps) {
  if (!isOpen) return null;
  const { subdomain } = useOwner()

  // Get slug and roomId
  const slug = subdomain?.slug || "";
  const roomId = booking.rooms?.[0]?.roomKey || "";

  // Fetch presigned URLs
  const { presignedUrls, isLoading: loadingUrls } = useRoomScopes(slug, roomId);

  // 1. Sort Calls
  const sortedCalls = useMemo(
    () =>
      [...(booking.calls || [])].sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ),
    [booking.calls]
  );

  // 2. Calculate Stats
  const totalValue = sortedCalls.reduce(
    (sum, c) => sum + (c.intelligence?.estimatedAdditionalValue || 0),
    0
  );

  // Calculate Total Interactions (Calls + Rooms)
  const totalInteractions =
    (booking.calls?.length || 0) + (booking.rooms?.length || 0);

  // 3. Project Config
  const scope = booking.projectScope || "UNKNOWN";
  const type = (booking as any).projectType || "RESIDENTIAL";
  const TypeIcon = type === "COMMERCIAL" ? Building2 : Home;

  // 4. Check data existence for empty state
  const hasCalls = sortedCalls.length > 0;
  const hasRooms = booking.rooms && booking.rooms.length > 0;
  console.log("Sorted Calls:", sortedCalls)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center sm:p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative w-full h-full sm:h-auto sm:max-h-[85vh] sm:max-w-2xl bg-white sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* HEADER */}
        <div className="shrink-0 flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-white">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <h3 className="text-lg font-bold text-slate-900 tracking-tight">
                {booking.name}
              </h3>
              <div className="hidden sm:flex px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-600 border border-slate-200 items-center gap-1 uppercase tracking-wide">
                <TypeIcon className="w-3 h-3" />
                {formatProjectScope(scope)}
              </div>
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-500 font-medium">
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                {totalInteractions} Interaction
                {totalInteractions !== 1 && "s"}
              </span>
              {totalValue > 0 && (
                <>
                  <span className="w-1 h-1 rounded-full bg-slate-300" />
                  <span className="flex items-center gap-1 text-emerald-600">
                    <TrendingUp className="w-3.5 h-3.5" />+
                    {getEstimatedValueRange(totalValue)} Value
                  </span>
                </>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 -mr-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* BODY */}
        <div className="flex-1 overflow-y-auto bg-slate-50/50 p-3 sm:p-6">
          <div className="space-y-6">
            {/* COMPONENT: SITE SURVEY (Rooms) */}
            {loadingUrls ? (
              <div className="text-center py-8 text-slate-400">Loading images...</div>
            ) : (
              <IntelRoom 
                rooms={booking.rooms} 
                presignedUrls={presignedUrls}
                createdAt={booking.rooms?.[0]?.createdAt}
              />
            )}

            {/* COMPONENT: CALLS LIST */}
            {sortedCalls.map((call) => (
              <IntelCall key={call.id} call={call} />
            ))}

            {/* EMPTY STATE */}
            {!hasCalls && !hasRooms && (
              <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-3">
                  <Calendar className="w-6 h-6 text-slate-300" />
                </div>
                <p className="text-sm">No intelligence data available.</p>
              </div>
            )}
          </div>
        </div>

        {/* FOOTER */}
        <div className="shrink-0 p-4 border-t border-slate-100 bg-white flex justify-end">
          <Button
            variant="outline"
            onClick={onClose}
            className="w-full sm:w-auto"
          >
            Close Viewer
          </Button>
        </div>
      </div>
    </div>
  );
}