"use client";

import { useState } from "react";
import { Receipt, ChevronDown, ChevronUp } from "lucide-react";

// ✨ NEW: Extracted Component to handle the expand/collapse state cleanly
export default function ThreadQuoteCard({ msg }: { msg: any }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const metadata = msg.metadata;

  // Clean text from URL
  const textBody = msg.body.replace(metadata.quoteLink, "").trim();

  return (
    <div className="flex flex-col gap-3 min-w-[240px] sm:min-w-[280px]">
      <div className="whitespace-pre-wrap leading-relaxed opacity-90 text-[14px]">
        {textBody}
      </div>

      <div className="bg-background/60 dark:bg-background/40 border border-current/10 rounded-xl p-3.5 flex flex-col gap-1 shadow-sm">
        {/* Header */}
        <div className="flex justify-between items-center mb-1">
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
            Quote Total
          </span>
          <span className="text-lg font-extrabold text-foreground tracking-tight">
            ${Number(metadata.totalAmount).toFixed(2)}
          </span>
        </div>

        {/* Toggle Button */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-1 w-fit text-xs font-medium text-muted-foreground hover:text-foreground transition-colors mb-2 opacity-80"
        >
          {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          {metadata.itemCount} item{metadata.itemCount === 1 ? "" : "s"}{" "}
          {isExpanded ? "(Hide)" : "(View)"}
        </button>

        {/* Expanded Items List */}
        {isExpanded && metadata.items && (
          <div className="flex flex-col gap-2 mt-1 mb-3 pt-3 border-t border-current/10">
            {metadata.items.map((item: any, idx: number) => (
              <div
                key={idx}
                className="flex justify-between items-start gap-3 text-xs pb-2 border-b border-current/5 last:border-0 last:pb-0"
              >
                <div className="flex flex-col flex-1">
                  {/* Title */}
                  <span className="font-medium text-foreground">
                    {item.title}
                  </span>

                  {/* 🟢 HERE IS THE DESCRIPTION 🟢 */}
                  {item.description && (
                    <span className="text-muted-foreground/80 mt-0.5 leading-snug truncate">
                      {item.description}
                    </span>
                  )}

                  {/* Quantity & Unit */}
                  <span className="text-muted-foreground opacity-70 mt-1 font-medium">
                    Qty: {item.quantity} {item.unit}
                  </span>
                </div>

                {/* Price */}
                <span className="font-semibold text-foreground">
                  ${Number(item.price).toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Portal Link */}
        <a
          href={metadata.quoteLink}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full flex items-center justify-center gap-2 mt-1 px-3 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg transition-all shadow-sm hover:shadow active:scale-[0.98]"
        >
          <Receipt size={14} /> Open Quote Portal
        </a>
      </div>
    </div>
  );
}
