"use client";

import React, { useState, useEffect } from "react";
import { CheckCircle2, Palette, Image as ImageIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { BookingData } from "@/types/subdomain-type";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { ColorPalette } from "./color-palette";

interface ProjectOverviewProps {
  booking: BookingData;
  logoSrc: string;
  presignedUrls: Record<string, string>;
}

export function ProjectOverview({ booking, logoSrc, presignedUrls }: ProjectOverviewProps) {
  const validImages = booking.mockups
    ?.map((m) => ({
      id: m.id,
      url: presignedUrls[m.s3Key],
    }))
    .filter((img) => img.url) || [];

  const [activeImage, setActiveImage] = useState<string | null>(null);

  useEffect(() => {
    if (validImages.length > 0 && !activeImage) {
      setActiveImage(validImages[0].url);
    }
  }, [validImages, activeImage]);

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
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
              Post Session
            </h1>
            <p className="text-zinc-500 text-sm">
              Reviewing details for your {" "}
              <span className="font-semibold text-primary">
                {booking.projectType || "Interior Paint"}
              </span>
              {""} project.
            </p>
          </div>
          <div className="self-start sm:self-auto">
            <Badge
              variant="outline"
              className="bg-green-50 text-green-700 border-green-200 px-3 py-1"
            >
              <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
              Session Complete
            </Badge>
          </div>
        </div>

        {/* --- MAIN CONTENT ROW (Always Flex Row) --- */}
        <div className="flex flex-row gap-4 items-start">
          
          {/* LEFT: Main Image & Thumbnails (Takes remaining space) */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <ImageIcon className="w-3.5 h-3.5 text-zinc-400" />
              <h3 className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                 Inspiration
              </h3>
            </div>

            {validImages.length > 0 && activeImage ? (
              <div className="space-y-2">
                {/* Main Hero Image */}
                <div className="relative w-full aspect-video bg-zinc-100 rounded-lg overflow-hidden border border-zinc-200 shadow-sm">
                  <img
                    src={activeImage}
                    alt="Main inspiration"
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Thumbnails */}
                <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                  {validImages.map((img) => (
                    <button
                      key={img.id}
                      onClick={() => setActiveImage(img.url)}
                      className={cn(
                        "relative flex-shrink-0 w-12 h-12 md:w-16 md:h-16 rounded-md overflow-hidden border-2 transition-all",
                        activeImage === img.url
                          ? "border-primary ring-2 ring-primary/20 opacity-100"
                          : "border-transparent opacity-60 hover:opacity-100 hover:border-zinc-300"
                      )}
                    >
                      <img
                        src={img.url}
                        alt="Thumbnail"
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="aspect-video bg-zinc-50 rounded-lg flex items-center justify-center text-zinc-400 border border-zinc-200 border-dashed">
                <p className="text-xs">No images</p>
              </div>
            )}
          </div>

          {/* RIGHT: Palette Component (Fixed Width, Minimal Style) */}
          {/* w-28 on mobile fits about 100px of content, perfect for name only */}
          <div className="w-28 sm:w-48 shrink-0">
            <div className="flex items-center gap-2 mb-2">
              <Palette className="w-3.5 h-3.5 text-zinc-400" />
              <h3 className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                Palette
              </h3>
            </div>
            
            <ColorPalette 
              colors={booking.paintColors} 
              variant="minimal" 
            />
          </div>

        </div>
      </div>
    </div>
  );
}