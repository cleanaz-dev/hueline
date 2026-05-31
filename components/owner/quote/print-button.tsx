// PrintButton.tsx
"use client";

import { Download } from "lucide-react";

export function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="flex items-center gap-2 bg-white border border-zinc-200 shadow-sm px-4 py-2 rounded-lg text-sm font-bold hover:bg-zinc-50 transition-all"
    >
      <Download className="w-4 h-4" />
      Save as PDF
    </button>
  );
}
