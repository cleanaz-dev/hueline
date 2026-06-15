"use client";

import { useState } from "react";
import { Receipt, ChevronDown, ChevronUp } from "lucide-react";
import Link from "next/link";

export default function ThreadQuoteCard({ msg }: { msg: any }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const metadata = msg.metadata;

  const textBody = msg.body.replace(metadata.quoteLink, "").trim();

  return (
    <div className="flex flex-col gap-3 overflow-hidden">
      <div className="whitespace-pre-wrap leading-relaxed opacity-90 text-[14px]">
        {textBody}
      </div>

      <div className="bg-background/60 dark:bg-background/40 border border-current/10 rounded-xl p-3.5 flex flex-col gap-1 shadow-sm overflow-hidden">
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
          <span
            className="transition-transform duration-300 ease-in-out"
            style={{
              transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)",
            }}
          >
            <ChevronDown size={14} />
          </span>
          {metadata.itemCount} item{metadata.itemCount === 1 ? "" : "s"}{" "}
          {isExpanded ? "(Hide)" : "(View)"}
        </button>

        {/* Expanded Items List */}
        <div
          className={`overflow-hidden transition-all duration-300 ease-in-out ${
            isExpanded ? "max-h-[600px] opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          {metadata.items && (
            <div className="flex flex-col gap-2 mt-1 mb-3 pt-3 border-t border-current/10">
              {metadata.items.map((item: any, idx: number) => (
                <div
                  key={idx}
                  className="flex justify-between items-start gap-3 text-xs pb-2 border-b border-current/5 last:border-0 last:pb-0"
                >
                  <div className="flex flex-col min-w-0 flex-1">
                    <span className="font-medium text-foreground">
                      {item.title.length > 50
                        ? item.title.slice(0, 50) + "..."
                        : item.title}
                    </span>

                    {item.description && (
                      <span className="text-muted-foreground/80 mt-0.5 leading-snug truncate">
                        {item.description.length > 60
                          ? item.description.slice(0, 60) + "…"
                          : item.description}
                      </span>
                    )}

                    <span className="text-muted-foreground opacity-70 mt-1 font-medium">
                      Qty: {item.quantity} {item.unit}
                    </span>
                  </div>

                  <span className="font-semibold text-foreground shrink-0">
                    ${Number(item.price).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Portal Link */}
        <Link
          href={metadata.quoteLink}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full flex items-center justify-center gap-2 mt-1 px-3 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg transition-all duration-200 shadow-sm hover:shadow active:scale-[0.98]"
        >
          <Receipt size={14} /> Open Quote Portal
        </Link>
      </div>
    </div>
  );
}
