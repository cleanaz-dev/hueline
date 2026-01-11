"use client";

import React from "react";
import {
  CheckCircle2,
  ArrowRight,
  Sparkles,
  FileText,
  Palette,
  DoorOpen,
  Maximize,
  AlertTriangle,
  Image as ImageIcon,
  Layers,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { TbWindow, TbDoor, TbPower } from "react-icons/tb";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";

// Mock Data Structure (This would come from your DB via huelineId)
const MOCK_DATA = {
  booking: {
    clientName: "Joshua",
    projectType: "Interior Paint",
    palettes: [
      { name: "Hale Navy", hex: "#2D3445" },
      { name: "Dove Wing", hex: "#E3E4E0" },
      { name: "Chantilly Lace", hex: "#F5F7F2" },
    ],
    inspirationImages: [
      "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?auto=format&fit=crop&q=80&w=800",
    ],
  },
  session: {
    counts: {
      windows: 4,
      doors: 3,
      outlets: 12,
    },
    findings: [
      {
        id: 1,
        label: "North Wall Crack",
        confidence: 98,
        img: "https://placehold.co/100",
      },
      {
        id: 2,
        label: "Water Stain - Ceiling",
        confidence: 89,
        img: "https://placehold.co/100",
      },
      {
        id: 3,
        label: "Trim Damage",
        confidence: 92,
        img: "https://placehold.co/100",
      },
    ],
  },
};

export default function ClientPostSession() {
  return (
    <div className="min-h-screen bg-zinc-50 font-sans text-zinc-900 pb-20">
      
      {/* --- 1. THE DREAM (Booking Data) --- */}
      <div className="bg-white border-b border-zinc-200">
        <div className="flex justify-center py-6">
          Logo
        </div>
        <div className="max-w-3xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
                Project Overview
              </h1>
              <p className="text-zinc-500 text-sm">
                Reviewing details for{" "}
                <span className="font-semibold text-purple-600">
                  {MOCK_DATA.booking.projectType}
                </span>
              </p>
            </div>
            <Badge
              variant="outline"
              className="bg-green-50 text-green-700 border-green-200 px-3 py-1"
            >
              <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
              Session Complete
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Inspiration Gallery (Takes up space) */}
            <div className="md:col-span-2 space-y-3">
              <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
                <ImageIcon className="w-3 h-3" /> Inspiration & Vibe
              </h3>
              <div className="grid grid-cols-3 gap-2 h-48">
                {/* Hero Image */}
                <div className="col-span-2 row-span-2 relative rounded-xl overflow-hidden group">
                  <img
                    src={MOCK_DATA.booking.inspirationImages[0]}
                    className="w-full h-full object-cover transition-transform group-hover:scale-105"
                  />
                </div>
                {/* Secondary Images */}
                <div className="rounded-xl overflow-hidden relative">
                  <img
                    src={MOCK_DATA.booking.inspirationImages[1]}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="rounded-xl overflow-hidden relative">
                  <img
                    src={MOCK_DATA.booking.inspirationImages[2]}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>

            {/* Color Palette (Sidebar) */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
                <Palette className="w-3 h-3" /> Selected Palette
              </h3>
              <div className="bg-zinc-50 rounded-xl p-4 border border-zinc-100 space-y-3">
                {MOCK_DATA.booking.palettes.map((color, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div
                      className="w-8 h-8 rounded-full border border-zinc-200 shadow-sm"
                      style={{ backgroundColor: color.hex }}
                    />
                    <div className="text-sm">
                      <p className="font-medium text-zinc-900">{color.name}</p>
                      <p className="text-[10px] text-zinc-400">{color.hex}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* --- 2. SEPARATOR (The Handoff) --- */}
      <div className="max-w-3xl mx-auto px-6 py-6">
        <div className="flex items-center gap-4">
          <Separator className="flex-1 bg-zinc-200" />
          <div className="flex items-center gap-2 text-muted-foreground bg-white px-3 py-1 rounded-full border border-zinc-200">
            <Sparkles className="w-4 h-4 text-purple-500" />
            <span className="text-xs font-semibold uppercase tracking-wider">
              AI Scope Analysis
            </span>
          </div>
          <Separator className="flex-1 bg-zinc-200" />
        </div>
      </div>

      {/* --- 3. THE REALITY (Session Data) --- */}
      <div className="max-w-3xl mx-auto px-6 space-y-8 animate-in slide-in-from-bottom-4 duration-700">
        {/* The Counts (Badges) */}
        <div className="grid grid-cols-3 gap-4">
          <CountCard
            icon={<TbWindow className="w-4 h-4 text-blue-500" />}
            label="Windows"
            count={MOCK_DATA.session.counts.windows}
          />
          <CountCard
            icon={<TbDoor className="w-4 h-4 text-amber-500" />}
            label="Doors"
            count={MOCK_DATA.session.counts.doors}
          />
          <CountCard
            icon={<TbPower className="w-4 h-4 text-purple-500" />}
            label="Outlets/Switches"
            count={MOCK_DATA.session.counts.outlets}
          />
        </div>

        {/* The Findings (Compact List) */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
            IMAGES, NOTES & QUESTIONS
          </h3>
          <div className="grid grid-cols-1 gap-3">
            {MOCK_DATA.session.findings.map((item) => (
              <div
                key={item.id}
                className="overflow-hidden border-zinc-200 hover:border-purple-200 transition-colors"
              >
                <div className=" flex items-center gap-3 bg-muted rounded-md px-4 py-2">
                  <div className="h-12 w-12 rounded-lg bg-zinc-100 overflow-hidden shrink-0">
                    <img
                      src={item.img}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-sm text-zinc-900">
                        {item.label}
                      </p>
                     
                    </div>
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                  >
                    <Trash2 />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* --- 4. ACTION (Q/A & Submit) --- */}
        <div className="bg-white rounded-xl border  p-6 shadow-sm space-y-6">
          {/* Q/A Box */}
          <div className="flex gap-4">
     
            <div className="space-y-2 flex-1">
              <h4 className="text-base font-bold text-zinc-900">
                Missed anything?
              </h4>
              <p className="text-xs text-zinc-500">
                Add any specific details the AI might have missed (e.g., "Paint
                inside the closet").
              </p>
              <Textarea
                placeholder="Type your notes here..."
                className="bg-zinc-50 border-zinc-200 resize-none min-h-[80px] focus:bg-white"
              />
            </div>
          </div>

          <Separator />

          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="p-2 bg-muted rounded-md">
              <p className="text-[12px]">
                Information has be sent to 'Company Name', any changes or
                modifications will be updated accordingly and shared.
              </p>
            </div>

            <Button size="lg">
              <FileText className="mr-2 w-4 h-4" />
              Update Information
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper Component for Counts
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
    <div className="bg-white border border-zinc-200 rounded-xl p-3 flex flex-col items-center justify-center gap-1 shadow-sm">
      <div className="bg-zinc-50 p-2 rounded-full mb-1">{icon}</div>
      <span className="text-2xl font-bold text-zinc-900">{count}</span>
      <span className="text-[10px] text-zinc-500 uppercase tracking-wide font-medium">
        {label}
      </span>
    </div>
  );
}
