"use client";

import React from "react";
import { Trash2, AlertCircle, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TbWindow, TbDoor, TbPower } from "react-icons/tb";
import { Room } from "@/types/subdomain-type";
import { ScopeItem, ScopeType } from "@/types/room-types";

interface ScopeAnalysisProps {
  room: Room;
  presignedUrls: Record<string, string>;
}

export function ScopeAnalysis({ room, presignedUrls }: ScopeAnalysisProps) {
  // Extract scope data
  const scopeData = room.scopeData as Record<string, ScopeItem> | null;

  // Get all scope items
  const allScopeItems: ScopeItem[] = scopeData
    ? Object.values(scopeData).filter(
        (item) => item && typeof item === "object" && "type" in item
      )
    : [];

  // Filter images and questions (Findings)
  const findings = allScopeItems.filter(
    (item) => item.type === ScopeType.IMAGE || item.type === ScopeType.QUESTION
  );

  // Count detections
  const detectionItems = allScopeItems.filter(
    (item) => item.type === ScopeType.DETECTION
  );
  
  const totalWindows = detectionItems.reduce(
    (sum, item) => sum + (item.detection_data?.windows || 0),
    0
  );
  const totalDoors = detectionItems.reduce(
    (sum, item) => sum + (item.detection_data?.doors || 0),
    0
  );
  const totalOutlets = 0; // Placeholder

  return (
    <>
      {/* The Counts */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <CountCard
          icon={<TbWindow className="w-5 h-5 text-blue-500" />}
          label="Windows"
          count={totalWindows}
        />
        <CountCard
          icon={<TbDoor className="w-5 h-5 text-amber-500" />}
          label="Doors"
          count={totalDoors}
        />
        <CountCard
          icon={<TbPower className="w-5 h-5 text-purple-500" />}
          label="Outlets"
          count={totalOutlets}
        />
      </div>

      {/* The Findings Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
            <AlertCircle className="w-3 h-3" /> Scope Findings
          </h3>
          <span className="text-[10px] bg-zinc-100 text-zinc-500 px-2 py-0.5 rounded-full border border-zinc-200">
            {findings.length} Items
          </span>
        </div>

        {findings.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {findings.map((item, index) => {
              const imageUrl = item.image_urls?.[0]
                ? presignedUrls[item.image_urls[0]]
                : null;

              return (
                <div
                  key={index}
                  className="group relative bg-white border border-zinc-200 rounded-xl overflow-hidden hover:shadow-lg hover:border-zinc-300 transition-all duration-300 flex flex-col"
                >
                  {/* Image Area */}
                  <div className="relative aspect-video w-full bg-zinc-100 overflow-hidden">
                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt={item.item}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full text-zinc-300 gap-1">
                        <ImageIcon className="w-8 h-8 opacity-50" />
                        <span className="text-[10px] font-medium uppercase tracking-wide">
                          No Image
                        </span>
                      </div>
                    )}

                    {/* Hover Actions */}
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <Button
                        variant="destructive"
                        size="icon"
                        className="h-8 w-8 rounded-full shadow-sm"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Content Area */}
                  <div className="p-3 flex flex-col gap-2 bg-white flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <span className="font-semibold text-sm text-zinc-900 capitalize leading-tight">
                        {item.item}
                      </span>
                    </div>

                    {item.action ? (
                      <div className="flex">
                        <Badge
                          variant="secondary"
                          className="text-[10px] h-5 px-1.5 font-medium border-zinc-200 bg-zinc-50 text-zinc-600"
                        >
                          {item.action}
                        </Badge>
                      </div>
                    ) : (
                      <p className="text-[11px] text-zinc-400 italic">
                        No specific action recorded
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="border border-dashed border-zinc-200 rounded-xl p-8 text-center bg-zinc-50/50">
            <p className="text-sm text-zinc-400">No findings recorded</p>
          </div>
        )}
      </div>
    </>
  );
}

// Internal Helper Component
function CountCard({
  icon,
  label,
  count,
}: {
  icon: React.ReactNode;
  label: string;
  count: number;
}) {
  return (
    <div className="bg-white border border-zinc-200 rounded-xl p-4 flex flex-col items-center justify-center gap-2 shadow-sm hover:border-purple-200 transition-colors">
      <div className="bg-zinc-50 p-2.5 rounded-full">{icon}</div>
      <div className="text-center">
        <span className="block text-2xl font-bold text-zinc-900 leading-none mb-1">
          {count}
        </span>
        <span className="text-[10px] text-zinc-500 uppercase tracking-wide font-semibold">
          {label}
        </span>
      </div>
    </div>
  );
}