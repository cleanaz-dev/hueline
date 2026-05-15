"use client";
import { useState } from "react";

// --- Types & Config ---
export interface PaintColor {
  name: string;
  code: string;
  hex: string;
  brand?: string;
  family: string;
  tone: "warm" | "cool" | "neutral";
  lightness: "light" | "medium" | "dark";
}

export type BrandId = "sherwin_williams" | "benjamin_moore" | "behr" | "ral";

export const BRAND_LABELS: Record<BrandId, string> = {
  sherwin_williams: "Sherwin-Williams",
  benjamin_moore: "Benjamin Moore",
  behr: "Behr",
  ral: "RAL",
};

// --- Color Data ---
const TRENDING_COLOR_SHADES: Record<BrandId, PaintColor[]> = {
  sherwin_williams: [
    { name: "Cavern Clay", code: "SW 7701", hex: "#BB6B45", family: "orange", tone: "warm", lightness: "medium" },
    { name: "Passionate", code: "SW 6871", hex: "#7C2C47", family: "red", tone: "warm", lightness: "dark" },
    { name: "Software", code: "SW 7074", hex: "#716A62", family: "brown", tone: "warm", lightness: "dark" },
  ],
  benjamin_moore: [
    { name: "Blue Nova", code: "825", hex: "#8994B4", family: "blue", tone: "cool", lightness: "medium" },
    { name: "Caliente", code: "AF-290", hex: "#C03535", family: "red", tone: "warm", lightness: "medium" },
    { name: "Salamander", code: "2050-10", hex: "#3C4A3E", family: "green", tone: "cool", lightness: "dark" },
  ],
  behr: [
    { name: "Breezeway", code: "MQ3-21", hex: "#87BCB8", family: "teal", tone: "cool", lightness: "light" },
    { name: "Terra Cotta", code: "PPU3-16", hex: "#BA6543", family: "orange", tone: "warm", lightness: "medium" },
    { name: "Dark Ash", code: "N510-5", hex: "#4D4944", family: "gray", tone: "warm", lightness: "dark" },
  ],
  ral: [
    { name: "Reseda Green", code: "RAL 6011", hex: "#587246", family: "green", tone: "neutral", lightness: "medium" },
    { name: "Red Lilac", code: "RAL 4001", hex: "#8D6879", family: "purple", tone: "cool", lightness: "medium" },
    { name: "Beige Brown", code: "RAL 8024", hex: "#A07241", family: "brown", tone: "warm", lightness: "medium" },
  ],
};

const MAIN_COLOR_SHADES: Record<BrandId, PaintColor[]> = {
  sherwin_williams: [
    { name: "Agreeable Gray", code: "SW 7029", hex: "#D1CBC1", family: "greige", tone: "warm", lightness: "light" },
    { name: "Naval", code: "SW 6244", hex: "#3A4456", family: "blue", tone: "cool", lightness: "dark" },
    { name: "Evergreen Fog", code: "SW 9130", hex: "#8F9E8D", family: "green", tone: "neutral", lightness: "medium" },
    { name: "Tricorn Black", code: "SW 6258", hex: "#2B2B2C", family: "black", tone: "neutral", lightness: "dark" },
  ],
  benjamin_moore: [
    { name: "Chantilly Lace", code: "OC-65", hex: "#F5F3EE", family: "white", tone: "neutral", lightness: "light" },
    { name: "Pale Oak", code: "OC-20", hex: "#D4C9B8", family: "greige", tone: "warm", lightness: "light" },
    { name: "Aegean Teal", code: "2136-40", hex: "#5B8585", family: "teal", tone: "cool", lightness: "medium" },
    { name: "Hale Navy", code: "HC-154", hex: "#434B56", family: "blue", tone: "cool", lightness: "dark" },
  ],
  behr: [
    { name: "Cracked Pepper", code: "PPU18-01", hex: "#3C3A38", family: "black", tone: "neutral", lightness: "dark" },
    { name: "Rumors", code: "N120-7", hex: "#7A3545", family: "red", tone: "warm", lightness: "dark" },
    { name: "Even Better Beige", code: "DC-010", hex: "#C9B89E", family: "beige", tone: "warm", lightness: "light" },
    { name: "Boreal", code: "N420-5", hex: "#3E5C4E", family: "green", tone: "cool", lightness: "dark" },
  ],
  ral: [
    { name: "Pure White", code: "RAL 9010", hex: "#F1ECE1", family: "white", tone: "warm", lightness: "light" },
    { name: "Jet Black", code: "RAL 9005", hex: "#0E0E10", family: "black", tone: "neutral", lightness: "dark" },
    { name: "Anthracite Grey", code: "RAL 7016", hex: "#293133", family: "gray", tone: "cool", lightness: "dark" },
    { name: "Traffic Red", code: "RAL 3020", hex: "#CC0605", family: "red", tone: "warm", lightness: "medium" },
  ],
};

interface Props {
  designId: string;
}

export default function SingleDesignStudio({ designId }: Props) {
  const [selectedBrand, setSelectedBrand] = useState<BrandId>("sherwin_williams");
  const [selectedColor, setSelectedColor] = useState<PaintColor | null>(null);
  const [removeFurniture, setRemoveFurniture] = useState(false);

  const imageUrl = null; // replace with dynamic image

  return (
    <div className="flex  w-full gap-6 bg-transparent p-6 font-sans text-zinc-900">
      
      {/* --- Left Column: Canvas & Controls --- */}
      <section className="flex flex-1 flex-col gap-4">
        
        {/* Canvas Area */}
        <div className="relative flex w-full flex-1 max-h-[65vh] items-center justify-center overflow-hidden rounded-2xl border border-black/5 bg-white shadow-sm ring-1 ring-zinc-100/50">
          {imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={imageUrl} alt="Design project" className="h-full w-full object-contain bg-zinc-50" />
          ) : (
            <div className="flex flex-col items-center text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-50 border border-zinc-100 shadow-sm">
                <svg className="h-8 w-8 text-zinc-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-sm font-semibold text-zinc-800">No Image Uploaded</h3>
              <p className="mt-1 text-sm text-zinc-500">Upload a room photo to start visualizing colors.</p>
            </div>
          )}
        </div>

        {/* Bottom Action Bar (Now including Generate) */}
        <div className="flex items-center justify-between rounded-2xl border border-black/5 bg-white p-4 shadow-sm">
          
          {/* Design Info */}
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-900 text-white shadow-sm">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
              </svg>
            </div>
            <div>
              <h2 className="text-sm font-bold leading-tight text-zinc-900">Design Studio</h2>
              <p className="text-xs font-medium text-zinc-500">ID: {designId || "PROJ-8291"}</p>
            </div>
          </div>

          {/* Center Toggle Control */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setRemoveFurniture(!removeFurniture)}
              className="group flex items-center gap-3"
            >
              <div className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 ${removeFurniture ? "bg-zinc-900" : "bg-zinc-200"}`}>
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform duration-300 ${removeFurniture ? "translate-x-6" : "translate-x-1"}`} />
              </div>
              <span className={`text-sm font-semibold transition-colors ${removeFurniture ? "text-zinc-900" : "text-zinc-500 group-hover:text-zinc-700"}`}>
                Remove Furniture
              </span>
            </button>
            <span className="rounded-md bg-amber-50 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-amber-600 ring-1 ring-amber-500/20">Beta</span>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            <button onClick={() => console.log("Share project")} className="inline-flex h-10 items-center gap-2 rounded-xl px-3 text-sm font-semibold text-zinc-600 transition-colors hover:bg-zinc-50 hover:text-zinc-900">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8m-4-6l-4-4m0 0L8 6m4-4v12" />
              </svg>
              Share
            </button>
            <button onClick={() => console.log("Connect booking")} className="inline-flex h-10 items-center gap-2 rounded-xl px-3 text-sm font-semibold text-zinc-600 transition-colors hover:bg-zinc-50 hover:text-zinc-900">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
              Connect
            </button>
            
            <div className="mx-1 h-5 w-px bg-zinc-200" /> {/* Divider */}

            {/* Generate Button Prominently Placed */}
            <button
              disabled={!selectedColor}
              onClick={() => console.log("Generate with:", selectedColor)}
              className={`group ml-1 flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold transition-all duration-200 ${
                selectedColor
                  ? "bg-zinc-900 text-white shadow-md shadow-zinc-900/10 hover:bg-zinc-800 hover:shadow-lg hover:shadow-zinc-900/20 active:scale-[0.98]"
                  : "cursor-not-allowed bg-zinc-100 text-zinc-400"
              }`}
            >
              <svg className={`h-4 w-4 ${selectedColor ? "text-amber-400" : "text-zinc-300"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                 <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
              </svg>
              Generate
            </button>
          </div>

        </div>
      </section>

      {/* --- Right Column: Color Properties --- */}
      <section className="flex w-[380px] shrink-0 flex-col overflow-hidden rounded-2xl border border-black/5 bg-white shadow-sm relative">
        
        {/* Scrollable Content */}
        {/* Added pb-32 to the scrollable area so colors can clear the chat widget */}
        <div className="flex-1 overflow-y-auto p-6 pb-32 scrollbar-hide">
          
          {/* Brand Selection Tabs */}
          <div className="mb-8">
            <h3 className="mb-3 text-[11px] font-bold uppercase tracking-wider text-zinc-400">Paint Brand</h3>
            <div className="flex flex-wrap gap-2">
              {(Object.keys(BRAND_LABELS) as BrandId[]).map((brand) => (
                <button
                  key={brand}
                  onClick={() => {
                      setSelectedBrand(brand);
                      setSelectedColor(null);
                  }}
                  className={`rounded-full px-4 py-2 text-xs font-bold transition-all ${
                    selectedBrand === brand
                      ? "bg-zinc-900 text-white shadow-md shadow-zinc-900/10"
                      : "bg-zinc-50 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900"
                  }`}
                >
                  {BRAND_LABELS[brand]}
                </button>
              ))}
            </div>
          </div>

          {/* Trending Colors */}
          <div className="mb-8">
            <h3 className="mb-3 flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-zinc-400">
              Trending 2024
              <svg className="h-4 w-4 text-amber-400" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
              </svg>
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {TRENDING_COLOR_SHADES[selectedBrand].map((color) => (
                <button
                  key={color.code}
                  onClick={() => setSelectedColor(color)}
                  className={`group relative overflow-hidden rounded-xl border text-left transition-all ${
                    selectedColor?.hex === color.hex ? "border-zinc-900 ring-1 ring-zinc-900 shadow-md" : "border-zinc-100 hover:border-zinc-300"
                  }`}
                >
                  <div className="h-16 w-full" style={{ backgroundColor: color.hex }} />
                  <div className="p-3 bg-white">
                    <p className="truncate text-sm font-bold text-zinc-900">{color.name}</p>
                    <p className="text-[11px] font-medium text-zinc-400">{color.code}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Full Palette Grid */}
          <div> 
            <h3 className="mb-3 text-[11px] font-bold uppercase tracking-wider text-zinc-400">Full Palette</h3>
            <div className="grid grid-cols-4 gap-2">
              {MAIN_COLOR_SHADES[selectedBrand].map((color) => (
                <button
                  key={color.code}
                  onClick={() => setSelectedColor(color)}
                  title={`${color.name} (${color.code})`}
                  className={`group relative aspect-square w-full overflow-hidden rounded-lg transition-all ${
                    selectedColor?.hex === color.hex 
                      ? "ring-2 ring-zinc-900 ring-offset-2 scale-105 z-10" 
                      : "ring-1 ring-black/5 hover:ring-black/20 hover:scale-105"
                  }`}
                >
                  <div className="absolute inset-0" style={{ backgroundColor: color.hex }} />
                  <div className="absolute inset-0 shadow-[inset_0_0_0_1px_rgba(0,0,0,0.05)]" />
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* --- Slim Active Color Readout --- */}
        {/* Sits at the bottom of the properties panel so the user has context for what they selected */}
        <div className="absolute bottom-0 left-0 right-0 border-t border-black/5 bg-white/95 p-4 backdrop-blur-xl flex items-center justify-between">
          <div>
            <p className="text-sm font-bold text-zinc-900">
              {selectedColor ? selectedColor.name : "Select a Color"}
            </p>
            <p className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider mt-0.5">
              {selectedColor ? `${BRAND_LABELS[selectedBrand]} • ${selectedColor.code}` : "Awaiting selection..."}
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

    </div>
  );
}