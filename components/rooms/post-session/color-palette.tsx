import React from "react";
import { cn } from "@/lib/utils";
import { Palette } from "lucide-react";

interface PaintColor {
  id: string;
  name: string;
  hex: string;
}

interface ColorPaletteProps {
  colors: PaintColor[] | undefined;
  variant?: "default" | "minimal"; // minimal = no hex, tighter spacing
  className?: string;
}

export function ColorPalette({ 
  colors, 
  variant = "default", 
  className 
}: ColorPaletteProps) {
  
  if (!colors || colors.length === 0) {
    return (
      <div className={cn("flex flex-col items-center justify-center py-4 text-zinc-300", className)}>
         <Palette className="w-3 h-3 mb-1 opacity-50" />
         <p className="text-[10px]">No colors</p>
      </div>
    );
  }

  return (
    <div className={cn(
      "w-full overflow-y-auto custom-scrollbar pr-1",
      // If default: add background/border. If minimal: clean list.
      variant === "default" 
        ? "bg-zinc-50 rounded-xl border border-zinc-200 p-3 max-h-[300px]" 
        : "max-h-[300px]",
      className
    )}>
      <div className={cn("space-y-2", variant === "minimal" && "space-y-1.5")}>
        {colors.map((color) => (
          <div 
            key={color.id} 
            className={cn(
              "flex items-center gap-2 transition-colors w-full",
              variant === "default" 
                ? "p-2 rounded-lg bg-white border border-zinc-100 shadow-sm"
                : "p-1 rounded-md hover:bg-zinc-50"
            )}
          >
            {/* Color Circle */}
            <div
              className={cn(
                "rounded-full border border-black/10 shadow-inner shrink-0",
                variant === "default" ? "w-6 h-6" : "w-4 h-4"
              )}
              style={{ backgroundColor: color.hex }}
            />
            
            {/* Text Info */}
            <div className="min-w-0 flex-1 overflow-hidden">
              <p className={cn(
                "font-semibold text-zinc-800 truncate leading-tight",
                variant === "default" ? "text-xs" : "text-[10px]"
              )}>
                {color.name}
              </p>
              
              {/* Show Hex ONLY if NOT minimal */}
              {variant !== "minimal" && (
                <p className="text-[10px] text-zinc-400 font-mono truncate mt-0.5">
                  {color.hex}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}