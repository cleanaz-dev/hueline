import { JsonObject } from "@/app/generated/prisma/runtime/library";
import { Skeleton } from "@/components/ui/skeleton";

export interface QuoteItem extends JsonObject {
  title?: string;
  description: string;
  quantity?: number;
  unit?: string;
  unitPrice?: number;
  price: number;
}

interface QuoteListProps {
  items: QuoteItem[];
  totalAmount: number;
  isOwner?: boolean;
  generatingQuote?: boolean;
}

export function QuoteList({ items, totalAmount, generatingQuote }: QuoteListProps) {
  const displayItems = items ?? [];
  const displayTotal = totalAmount ?? 0;

  return (
    <div className="mb-6">
      <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-4 print:text-zinc-500 print:break-after-avoid">
        Line Items
      </h3>

      <div className="border border-zinc-200 rounded-xl overflow-hidden print:border-zinc-300">
        <table className="w-full text-left text-sm">
          <thead className="bg-zinc-50 text-zinc-500 font-medium border-b border-zinc-200 print:bg-zinc-100/50">
            <tr>
              <th className="p-4 w-1/2">Item & Description</th>
              <th className="p-4 text-right w-1/6">Qty</th>
              <th className="p-4 text-right w-1/6">Rate</th>
              <th className="p-4 text-right w-1/6">Amount</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-zinc-200 font-medium">
            {generatingQuote ? (
              // --- 1. SKELETON LOADING STATE ---
              Array.from({ length: 4 }).map((_, i) => (
                <tr key={`skeleton-${i}`} className="print:break-inside-avoid">
                  <td className="p-4 align-top">
                    <Skeleton className="h-4 w-3/4 mb-2 bg-zinc-200" />
                    <Skeleton className="h-3 w-full mb-1.5 bg-zinc-100" />
                    <Skeleton className="h-3 w-4/5 bg-zinc-100" />
                  </td>
                  <td className="p-4 align-top">
                    <div className="flex justify-end"><Skeleton className="h-4 w-8 bg-zinc-200" /></div>
                  </td>
                  <td className="p-4 align-top">
                    <div className="flex justify-end"><Skeleton className="h-4 w-12 bg-zinc-200" /></div>
                  </td>
                  <td className="p-4 align-top">
                    <div className="flex justify-end"><Skeleton className="h-4 w-16 bg-zinc-200" /></div>
                  </td>
                </tr>
              ))
            ) : displayItems.length > 0 ? (
              // --- 2. ACTUAL ITEMS DATA ---
              displayItems.map((item, i) => {
                const qty = item.quantity ?? 1;
                const rate = item.unitPrice ?? item.price;
                const lineTotal = item.price;

                return (
                  <tr key={i} className="print:break-inside-avoid hover:bg-zinc-50/50 transition-colors">
                    <td className="p-4 text-zinc-900 align-top">
                      {item.title && (
                        <div className="font-bold mb-1 text-zinc-900">{item.title}</div>
                      )}
                      <div className={`leading-relaxed ${item.title ? "text-zinc-500 text-xs font-normal" : ""}`}>
                        {item.description}
                      </div>
                    </td>
                    <td className="p-4 text-right align-top text-zinc-600">
                      {qty} <span className="text-zinc-400 text-xs">{item.unit || ""}</span>
                    </td>
                    <td className="p-4 text-right align-top text-zinc-600">
                      ${typeof rate === "number" ? rate.toFixed(2) : rate}
                    </td>
                    <td className="p-4 text-right align-top text-zinc-900 font-semibold">
                      ${typeof lineTotal === "number" ? lineTotal.toFixed(2) : lineTotal}
                    </td>
                  </tr>
                );
              })
            ) : (
              // --- 3. EMPTY STATE (No items, not generating) ---
              <tr>
                <td colSpan={4} className="p-8 text-center text-zinc-500 text-sm">
                  No line items generated yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex justify-end pt-5 pr-4 print:break-inside-avoid">
        <div className="flex items-center text-right">
          <span className="text-sm text-zinc-500 font-medium mr-4">Total Amount:</span>
          {generatingQuote ? (
            // Skeleton for Total Amount
            <Skeleton className="h-8 w-28 bg-zinc-200" />
          ) : (
            <span className="text-2xl font-black text-zinc-900 tracking-tight">
              ${displayTotal.toFixed(2)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}