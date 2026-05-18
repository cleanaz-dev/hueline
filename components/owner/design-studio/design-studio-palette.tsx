"use client";

import { 
  BRAND_LABELS, 
  TRENDING_COLOR_SHADES, 
  MAIN_COLOR_SHADES, 
  BrandId, 
  PaintColor 
} from "@/lib/desing-studio-config";
import { Sparkles } from "lucide-react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

interface Props {
  selectedBrand: BrandId;
  setSelectedBrand: (brand: BrandId) => void;
  selectedColor: PaintColor | null;
  setSelectedColor: (color: PaintColor | null) => void;
}

export function DesignStudioPalette({
  selectedBrand,
  setSelectedBrand,
  selectedColor,
  setSelectedColor,
}: Props) {
  return (
    <section className="relative flex w-[380px] shrink-0 flex-col overflow-hidden rounded-2xl border border-black/5 bg-white shadow-sm">
      <div className="flex-1 overflow-y-auto p-6 pb-32 scrollbar-hide">
        
        {/* Brand Selector */}
        <div className="mb-8">
          <h3 className="mb-3 text-[11px] font-bold uppercase tracking-wider text-zinc-400">
            Paint Brand
          </h3>
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

        {/* Trending Colors */}
        <div className="mb-8">
          <h3 className="mb-3 flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-zinc-400">
            Trending 2026{" "}
            <Sparkles className="h-3.5 w-3.5 text-amber-400" />
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {TRENDING_COLOR_SHADES[selectedBrand].map((color) => (
              <button
                key={color.code}
                // ✅ FIX: Inject the brand dynamically when clicked!
                onClick={() => setSelectedColor({ ...color, brand: selectedBrand })}
                className={`group relative overflow-hidden rounded-xl border text-left transition-all ${
                  selectedColor?.hex === color.hex 
                    ? "border-zinc-900 ring-1 ring-zinc-900 shadow-md" 
                    : "border-zinc-100 hover:border-zinc-300"
                }`}
              >
                <div
                  className="h-16 w-full"
                  style={{ backgroundColor: color.hex }}
                />
                <div className="bg-white p-3">
                  <p className="truncate text-sm font-bold text-zinc-900">
                    {color.name}
                  </p>
                  <p className="text-[11px] font-medium text-zinc-400">
                    {color.code}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Full Palette */}
        <div>
          <h3 className="mb-3 text-[11px] font-bold uppercase tracking-wider text-zinc-400">
            Full Palette
          </h3>
          <div className="grid grid-cols-4 gap-2">
            {MAIN_COLOR_SHADES[selectedBrand].map((color) => (
              <button
                key={color.code}
                // ✅ FIX: Inject the brand dynamically when clicked!
                onClick={() => setSelectedColor({ ...color, brand: selectedBrand })}
                title={`${color.name} (${color.code})`}
                className={`group relative aspect-square w-full overflow-hidden rounded-lg transition-all ${
                  selectedColor?.hex === color.hex 
                    ? "z-10 scale-105 ring-2 ring-zinc-900 ring-offset-2" 
                    : "ring-1 ring-black/5 hover:scale-105 hover:ring-black/20"
                }`}
              >
                <div
                  className="absolute inset-0"
                  style={{ backgroundColor: color.hex }}
                />
                <div className="absolute inset-0 shadow-[inset_0_0_0_1px_rgba(0,0,0,0.05)]" />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Sticky Status Bar */}
      <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between border-t border-black/5 bg-white/95 p-4 backdrop-blur-xl rounded-bl-2xl rounded-br-2xl">
        <div>
          <p className="text-sm font-bold text-zinc-900">
            {selectedColor ? selectedColor.name : "Select a Color"}
          </p>
          <p className="mt-0.5 text-[11px] font-medium uppercase tracking-wider text-zinc-500">
            {selectedColor
              ? `${BRAND_LABELS[selectedBrand]} • ${selectedColor.code}`
              : "Awaiting selection..."}
          </p>
        </div>
        {selectedColor ? (
          <div
            className="h-10 w-10 rounded-full shadow-[inset_0_0_0_1px_rgba(0,0,0,0.1),_0_2px_8px_rgba(0,0,0,0.1)]"
            style={{ backgroundColor: selectedColor.hex }}
          />
        ) : (
          <div className="h-10 w-10 rounded-full border border-dashed border-zinc-300 bg-zinc-50" />
        )}
      </div>
    </section>
  );
}