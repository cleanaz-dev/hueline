"use client";

import { useMemo } from "react";
import useSWR from "swr";
import { 
  User, 
  CheckCircle2, 
  Activity,
  DatabaseZap
} from "lucide-react";
import { Room, BookingData } from "@/types/subdomain-type";
import { RoomDetailsTabs } from "./room-details-tabs";
import { SecureVideoPlayer } from "./video/secure-video-player";
import { ScopeItem } from "@/types/room-types";
import { useOwner } from "@/context/owner-context";
import { RoomInteractionProvider } from "./room-interaction-context"; // IMPORT THIS

interface RoomDetailsProps {
  room: Room & { booking?: BookingData };
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function RoomDetailsView({ room: initialRoomData }: RoomDetailsProps) {
  const { subdomain } = useOwner();
  const roomId = initialRoomData?.roomKey;

  const apiEndpoint = `/api/subdomain/${subdomain.slug}/room/${roomId}/scopes`;

  const { data: roomData, mutate } = useSWR(apiEndpoint, fetcher, {
    fallbackData: initialRoomData,
    revalidateOnFocus: false,
  });

  const scopeItems = (Array.isArray(roomData.scopeData) 
    ? roomData.scopeData 
    : (roomData.scopeData as any)?.items || []) as ScopeItem[];

  const presignedUrls = useMemo(() => {
    return (roomData?.presignedUrls || {}) as Record<string, string>;
  }, [roomData]);

  return (
    // 1. WRAP THE ENTIRE VIEW IN THE INTERACTION PROVIDER
    <RoomInteractionProvider>
      <div className="flex flex-col h-[calc(100vh-4rem)] lg:h-[calc(100vh-7rem)] bg-white">
        
        {/* HEADER */}
        <header className="flex-none h-12 border-b border-zinc-200 flex items-center justify-between px-4 lg:px-6 bg-white z-10">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 text-xs font-medium text-zinc-600">
              <User className="w-3.5 h-3.5 text-zinc-400" /> 
              <span className="truncate max-w-[120px] sm:max-w-none">{roomData.clientName || "Unknown Client"}</span>
            </div>

            <div className="hidden sm:flex items-center gap-1.5 text-[10px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
              <CheckCircle2 className="w-3 h-3" /> 
              <span>Survey Complete</span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-zinc-500">
             <DatabaseZap className="w-3.5 h-3.5 text-zinc-400" />
             <span className="font-mono font-bold text-zinc-900">{scopeItems.length}</span>
             <span className="text-zinc-400 hidden sm:inline">items captured</span>
          </div>
        </header>

        {/* CONTENT */}
        <div className="flex-1 flex flex-col lg:flex-row lg:overflow-hidden">
          
          {/* LEFT: VIDEO */}
          <div className="w-full lg:flex-1 bg-zinc-50 flex flex-col relative lg:overflow-y-auto">
            <div className="flex-1 p-4 lg:p-8 flex flex-col items-center justify-start lg:justify-center min-h-0">
              <div className="w-full max-w-5xl mx-auto flex flex-col gap-3">
                <div className="flex items-center justify-between px-1">
                   <h2 className="text-xs font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                      <Activity className="w-3.5 h-3.5" /> Session Recording
                   </h2>
                   {roomData.recordingUrl && (
                     <span className="text-[10px] font-mono text-zinc-400 bg-white px-1.5 py-0.5 rounded border border-zinc-200">
                       REC
                     </span>
                   )}
                </div>

                <div className="relative aspect-video w-full bg-zinc-900 rounded-xl lg:rounded-2xl overflow-hidden shadow-xl shadow-zinc-200/50 border border-zinc-200 group ring-1 ring-zinc-900/5">
                  {roomData.recordingUrl ? (
                    <SecureVideoPlayer 
                      roomId={roomId} 
                      className="w-full h-full" 
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-zinc-500 text-sm">
                      No recording available
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: TABS */}
          <div className="w-full lg:w-[420px] h-[500px] lg:h-full z-20 bg-white shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)] lg:shadow-none border-l border-zinc-200">
            <RoomDetailsTabs 
              items={scopeItems} 
              roomId={roomId} 
              presignedUrls={presignedUrls}
              onDataChange={mutate} 
            />
          </div>

        </div>
      </div>
    </RoomInteractionProvider>
  );
}