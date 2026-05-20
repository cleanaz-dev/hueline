"use client";

import { 
  BRAND_LABELS, 
  TRENDING_COLOR_SHADES, 
  MAIN_COLOR_SHADES, 
  BrandId, 
  PaintColor 
} from "@/lib/desing-studio-config";
import { Sparkles, ChevronLeft, ExternalLink, Activity, Info } from "lucide-react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Mockup } from "@/app/generated/prisma";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
  selectedBrand: BrandId;
  setSelectedBrand: (brand: BrandId) => void;
  selectedColor: PaintColor | null;
  setSelectedColor: (color: PaintColor | null) => void;
  selectedMockup: Mockup | null;
  setSelectedMockup: (m: Mockup | null) => void;
  huelineId?: string;
}

// Helper to convert HEX to RGB for the technical breakdown
function hexToRgb(hex: string) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : { r: 0, g: 0, b: 0 };
}

export function DesignStudioPalette({
  selectedBrand,
  setSelectedBrand,
  selectedColor,
  setSelectedColor,
  selectedMockup,
  setSelectedMockup,
  huelineId,
}: Props) {
  
  const brandName = selectedMockup?.brand || selectedMockup?.colorBrand || "";
  const cleanBrandName = brandName.replace("_", " ");
  const colorName = selectedMockup?.name || selectedMockup?.colorName;
  const colorCode = selectedMockup?.code || selectedMockup?.colorCode;
  const hex = selectedMockup?.hex || selectedMockup?.colorHex || "#cccccc";
  
  const rgb = hexToRgb(hex);

  return (
    <section className="relative w-[380px] shrink-0 overflow-hidden rounded-2xl border border-black/5 bg-white shadow-sm">
      <AnimatePresence>
        
        {/* ========================================== */}
        {/* VIEW 1: MOCKUP DETAILS                     */}
        {/* ========================================== */}
        {selectedMockup ? (
          <motion.div 
            key="mockup-view"
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 flex flex-col p-6 bg-white z-10"
          >
            <button 
              onClick={() => setSelectedMockup(null)}
              className="flex w-fit items-center gap-1.5 rounded-lg pr-3 py-1.5 text-xs font-bold text-zinc-500 transition-colors hover:bg-zinc-50 hover:text-zinc-900 mb-6"
            >
              <ChevronLeft className="h-4 w-4" />
              Back to Palette
            </button>

            <div className="flex-1 flex flex-col">
              {/* Header */}
              <div className="mb-6">
                <h4 className="text-[11px] font-bold uppercase tracking-widest text-zinc-400 mb-2">Applied Mockup Color</h4>
                <h2 className="text-3xl font-black tracking-tight text-zinc-900 leading-none mb-1.5">
                  {colorName}
                </h2>
                <p className="text-sm font-medium text-zinc-500 capitalize">
                  {cleanBrandName} • {colorCode}
                </p>
              </div>

              {/* HEX Card */}
              <div className="flex items-center gap-4 rounded-2xl border border-zinc-100 bg-zinc-50 p-4 mb-4">
                <div 
                  className="h-14 w-14 rounded-full border border-black/10 shadow-inner"
                  style={{ backgroundColor: hex }}
                />
                <div className="flex flex-col">
                  <span className="text-[11px] font-bold tracking-widest text-zinc-400">HEX CODE</span>
                  <span className="font-mono text-lg font-bold text-zinc-900">
                    {hex}
                  </span>
                </div>
              </div>

              {/* NEW: Color DNA & Technical Specs to fill the empty space */}
              <div className="flex flex-col gap-4 rounded-2xl border border-zinc-100 bg-zinc-50/50 p-5 flex-1 relative overflow-hidden">
                {/* Subtle soft background glow using the selected color */}
                <div 
                  className="absolute -top-10 -right-10 h-32 w-32 rounded-full opacity-10 blur-3xl pointer-events-none"
                  style={{ backgroundColor: hex }}
                />

                <h4 className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 flex items-center gap-1.5">
                  <Activity className="h-3.5 w-3.5" />
                  Color Composition
                </h4>
                
                {/* RGB Grid */}
                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-white p-3 rounded-xl border border-zinc-100 flex flex-col items-center justify-center shadow-sm">
                    <span className="text-[10px] font-bold text-red-400 mb-0.5">R</span>
                    <span className="font-mono text-sm font-bold text-zinc-800">{rgb.r}</span>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-zinc-100 flex flex-col items-center justify-center shadow-sm">
                    <span className="text-[10px] font-bold text-green-500 mb-0.5">G</span>
                    <span className="font-mono text-sm font-bold text-zinc-800">{rgb.g}</span>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-zinc-100 flex flex-col items-center justify-center shadow-sm">
                    <span className="text-[10px] font-bold text-blue-500 mb-0.5">B</span>
                    <span className="font-mono text-sm font-bold text-zinc-800">{rgb.b}</span>
                  </div>
                </div>

                {/* Render Metadata */}
                <div className="mt-auto flex flex-col gap-3 pt-4 border-t border-zinc-200/60">
                  <h4 className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 flex items-center gap-1.5">
                    <Info className="h-3.5 w-3.5" />
                    Render Specs
                  </h4>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-zinc-500">Target Area</span>
                    <span className="font-medium capitalize text-zinc-900">{selectedMockup.roomType || 'Room'}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-zinc-500">Render Engine</span>
                    <span className="font-medium text-zinc-900">Hue-Line AI</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-zinc-500">Recommended Finish</span>
                    <span className="font-medium text-zinc-900">Interior Flat / Eggshell</span>
                  </div>
                </div>
              </div>

              {/* Booking Action */}
              <div className="mt-6">
                {huelineId ? (
                  <>
                    <div className="flex items-center justify-between text-xs mb-3 px-1">
                      <span className="font-semibold text-zinc-500">Booking Ref</span>
                      <span className="font-mono font-bold text-zinc-900">{huelineId}</span>
                    </div>
                    <Link                       
                      href={`/booking/${huelineId}`} 
                      target="_blank"
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-zinc-900 px-4 py-3.5 text-sm font-bold text-white shadow-lg transition-transform hover:scale-[1.02] active:scale-[0.98]"
                    >
                      Open Client Portal <ExternalLink className="h-4 w-4" />
                    </Link>
                  </>
                ) : (
                  <div className="rounded-xl border border-dashed border-zinc-200 p-4 text-center">
                    <p className="text-xs font-medium text-zinc-500">No Portal Link Available</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        ) : (
          
          /* ========================================== */
          /* VIEW 2: STANDARD PALETTE                   */
          /* ========================================== */
          <motion.div 
            key="palette-view"
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            // Absolute inset-0 so it perfectly fills the stretched container
            className="absolute inset-0 flex flex-col bg-white"
          >
            <div className="flex-1 overflow-y-auto p-6 pb-32 scrollbar-hide">
              <div className="mb-8">
                <h3 className="mb-3 text-[11px] font-bold uppercase tracking-wider text-zinc-400">Paint Brand</h3>
                <ToggleGroup
                  type="single"
                  value={selectedBrand}
                  onValueChange={(value) => {
                    if (value) {
                      setSelectedBrand(value as BrandId);
                      setSelectedColor(null);
                    }
                  }}
                  className="flex flex-wrap justify-start gap-2"
                >
                  {(Object.keys(BRAND_LABELS) as BrandId[]).map((brand) => (
                    <ToggleGroupItem
                      key={brand}
                      value={brand}
                      className="rounded-full px-4 py-2 text-xs font-bold data-[state=on]:bg-zinc-900 data-[state=on]:text-white data-[state=on]:shadow-md transition-all hover:bg-zinc-100"
                    >
                      {BRAND_LABELS[brand]}
                    </ToggleGroupItem>
                  ))}
                </ToggleGroup>
              </div>

              <div className="mb-8">
                <h3 className="mb-3 flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                  Trending 2026 <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {TRENDING_COLOR_SHADES[selectedBrand].map((color) => (
                    <button
                      key={color.code}
                      onClick={() => setSelectedColor({ ...color, brand: selectedBrand })}
                      className={`group relative overflow-hidden rounded-xl border text-left transition-all ${
                        selectedColor?.hex === color.hex ? "border-zinc-900 ring-1 ring-zinc-900 shadow-md" : "border-zinc-100 hover:border-zinc-300"
                      }`}
                    >
                      <div className="h-16 w-full" style={{ backgroundColor: color.hex }} />
                      <div className="bg-white p-3">
                        <p className="truncate text-sm font-bold text-zinc-900">{color.name}</p>
                        <p className="text-[11px] font-medium text-zinc-400">{color.code}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="mb-3 text-[11px] font-bold uppercase tracking-wider text-zinc-400">Full Palette</h3>
                <div className="grid grid-cols-4 gap-2">
                  {MAIN_COLOR_SHADES[selectedBrand].map((color) => (
                    <button
                      key={color.code}
                      onClick={() => setSelectedColor({ ...color, brand: selectedBrand })}
                      title={`${color.name} (${color.code})`}
                      className={`group relative aspect-square w-full overflow-hidden rounded-lg transition-all ${
                        selectedColor?.hex === color.hex ? "z-10 scale-105 ring-2 ring-zinc-900 ring-offset-2" : "ring-1 ring-black/5 hover:scale-105 hover:ring-black/20"
                      }`}
                    >
                      <div className="absolute inset-0" style={{ backgroundColor: color.hex }} />
                      <div className="absolute inset-0 shadow-[inset_0_0_0_1px_rgba(0,0,0,0.05)]" />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Bottom Sticky Status Bar */}
            <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between border-t border-black/5 bg-white/95 p-4 backdrop-blur-xl rounded-b-xl">
              <div>
                <p className="text-sm font-bold text-zinc-900">{selectedColor ? selectedColor.name : "Select a Color"}</p>
                <p className="mt-0.5 text-[11px] font-medium uppercase tracking-wider text-zinc-500">
                  {selectedColor ? `${BRAND_LABELS[selectedBrand]} • ${selectedColor.code}` : "Awaiting selection..."}
                </p>
              </div>
              {selectedColor ? (
                <div className="h-10 w-10 rounded-full shadow-[inset_0_0_0_1px_rgba(0,0,0,0.1),_0_2px_8px_rgba(0,0,0,0.1)]" style={{ backgroundColor: selectedColor.hex }} />
              ) : (
                <div className="h-10 w-10 rounded-full border border-dashed border-zinc-300 bg-zinc-50" />
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}