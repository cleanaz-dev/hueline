"use client";

import React from "react";
import { CheckCircle2, Palette, Image as ImageIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { BookingData } from "@/types/subdomain-type";
import Image from "next/image";

interface ProjectOverviewProps {
  booking: BookingData;
  logoSrc: string;
  presignedUrls: Record<string, string>;
}

export function ProjectOverview({ booking, logoSrc, presignedUrls }: ProjectOverviewProps) {
  return (
    <div className="bg-white border-b border-zinc-200">
      <div className="flex justify-center pt-6">
        <Image
          src={logoSrc}
          height={100}
          width={100}
          alt="logo"
          className="w-36 object-contain"
          priority
        />
      </div>
      <div className="max-w-3xl mx-auto px-4 md:px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
              Project Overview
            </h1>
            <p className="text-zinc-500 text-sm">
              Reviewing details for{" "}
              <span className="font-semibold text-purple-600">
                {booking.projectType || "Interior Paint"}
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
          {/* Inspiration Gallery */}
          <div className="md:col-span-2 space-y-3">
            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
              <ImageIcon className="w-3 h-3" /> Inspiration & Vibe
            </h3>
            {booking.mockups && booking.mockups.length > 0 ? (
              <div className="grid grid-cols-3 gap-2 h-48">
                {/* Hero Image */}
                <div className="col-span-2 row-span-2 relative rounded-xl overflow-hidden group border border-zinc-100">
                  <img
                    src={
                      presignedUrls[booking.mockups[0].s3Key] ||
                      "https://placehold.co/800"
                    }
                    alt="Main inspiration"
                    className="w-full h-full object-cover transition-transform group-hover:scale-105"
                  />
                </div>
                {/* Secondary Images */}
                {booking.mockups.slice(1, 3).map((mockup, i) => (
                  <div
                    key={mockup.id}
                    className="rounded-xl overflow-hidden relative border border-zinc-100"
                  >
                    <img
                      src={
                        presignedUrls[mockup.s3Key] ||
                        "https://placehold.co/400"
                      }
                      alt={`Inspiration ${i + 2}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-48 bg-zinc-100 rounded-xl flex items-center justify-center text-zinc-400 border border-zinc-200 border-dashed">
                No mockup images available
              </div>
            )}
          </div>

          {/* Color Palette */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
              <Palette className="w-3 h-3" /> Selected Palette
            </h3>
            <div className="bg-zinc-50 rounded-xl p-4 border border-zinc-200 space-y-3 h-48 overflow-y-auto">
              {booking.paintColors && booking.paintColors.length > 0 ? (
                booking.paintColors.map((color) => (
                  <div key={color.id} className="flex items-center gap-3">
                    <div
                      className="w-8 h-8 rounded-full border border-zinc-200 shadow-sm shrink-0"
                      style={{ backgroundColor: color.hex }}
                    />
                    <div className="text-sm">
                      <p className="font-medium text-zinc-900 leading-none mb-1">
                        {color.name}
                      </p>
                      <p className="text-[10px] text-zinc-400 font-mono">
                        {color.hex}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-zinc-400 text-center py-8">
                  No colors selected
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}