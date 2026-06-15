import { FileText, CheckCircle, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { Quote } from "@/app/generated/prisma"; // Adjust import if moved to a new file

export function SideBarQuoteSummary({
  customerQuote,
  customerName,
}: {
  customerQuote?: Quote;
  customerName: string;
}) {
  if (!customerQuote) return null;

  const isAccepted = customerQuote.status === "ACCEPTED";

  return (
    <div className="mt-6">
      {/* Section Header */}
      <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-3">
        Quote Overview
      </h4>

      <div className="flex flex-col gap-3">
        {/* Main Info Row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Cuter, slightly larger Icon Container */}
            <div
              className={cn(
                "w-8 h-8 rounded-xl flex items-center justify-center shrink-0",
                isAccepted
                  ? "bg-green-100 text-green-600"
                  : "bg-amber-100 text-amber-600"
              )}
            >
              <FileText className="w-4 h-4" />
            </div>

            {/* Readable Inline Stats */}
            <div className="flex items-center flex-wrap gap-x-2 gap-y-1">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Quote
                </span>
                <span className="bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-md text-[10px] font-bold tracking-wider">
                  v{(customerQuote as any).version || 1}
                </span>
              </div>

              <span className="text-slate-300">•</span>

              <span className="text-sm font-medium text-slate-600">
                {Array.isArray(customerQuote.items)
                  ? customerQuote.items.length
                  : 0}{" "}
                items
              </span>

              {customerQuote.totalAmount != null && (
                <>
                  <span className="text-slate-300">•</span>
                  <span className="text-sm font-bold text-slate-800">
                    ${customerQuote.totalAmount.toFixed(2)}
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Status Badge */}
          <div
            className={cn(
              "px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border shrink-0",
              isAccepted
                ? "bg-green-50 text-green-700 border-green-200"
                : "bg-amber-50 text-amber-700 border-amber-200"
            )}
          >
            {customerQuote.status}
          </div>
        </div>

        {/* Contextual Status Message Footer */}
        <div className="flex items-center gap-2 pl-1">
          {isAccepted ? (
            <>
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span className="text-[13px] font-medium text-slate-600">
                {customerName || "Customer"} has accepted this quote.
              </span>
            </>
          ) : (
            <>
              <Clock className="w-4 h-4 text-amber-500" />
              <span className="text-[13px] font-medium text-slate-600">
                {customerName || "Customer"} has not accepted the quote yet.
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}