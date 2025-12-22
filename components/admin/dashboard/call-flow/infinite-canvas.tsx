// components/admin/call-flow/infinite-canvas.tsx

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { ZoomIn, ZoomOut, Maximize } from "lucide-react";
import { Separator } from "@/components/ui/separator";

interface Props {
  children: React.ReactNode;
}

export function InfiniteCanvas({ children }: Props) {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest(".no-drag")) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPosition({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
  };

  return (
    <div className="relative h-full w-full overflow-hidden bg-gray-50 rounded-xl border border-gray-200">
      {/* Viewport */}
      <div
        className={`w-full h-full ${isDragging ? "cursor-grabbing" : "cursor-grab"}`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={() => setIsDragging(false)}
        onMouseLeave={() => setIsDragging(false)}
      >
        <div
          style={{
            transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
            transformOrigin: "top center",
            transition: isDragging ? "none" : "transform 0.1s ease-out",
          }}
          className="w-full h-full min-h-[2000px] min-w-[2000px] flex justify-center pt-20"
        >
          {/* Background Grid */}
          <div
            className="absolute inset-0 z-0 pointer-events-none opacity-30"
            style={{
              backgroundImage: "radial-gradient(#94a3b8 1px, transparent 1px)",
              backgroundSize: "24px 24px",
            }}
          />
          {/* Content */}
          <div className="relative z-10">{children}</div>
        </div>
      </div>

      {/* Controls */}
      <div className="absolute bottom-6 left-6 flex items-center gap-2 bg-white p-1.5 rounded-lg border border-gray-200 shadow-md z-20">
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setScale(s => Math.max(s - 0.1, 0.5))}>
          <ZoomOut className="w-4 h-4" />
        </Button>
        <span className="text-xs font-mono w-12 text-center text-gray-500">{Math.round(scale * 100)}%</span>
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setScale(s => Math.min(s + 0.1, 2))}>
          <ZoomIn className="w-4 h-4" />
        </Button>
        <Separator orientation="vertical" className="h-5 mx-1" />
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setScale(1); setPosition({ x: 0, y: 0 }); }}>
          <Maximize className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}