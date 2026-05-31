"use client"
import { CheckCircle } from "lucide-react";

import { PrintButton } from "@/components/owner/quote/print-button";
import { QuoteData } from "@/lib/prisma/queries/quote/get-quote";
import { JsonObject } from "@/app/generated/prisma/runtime/library";

interface QuoteItem extends JsonObject{
  description: string;
  price: number;
}

interface Props {
  quote: QuoteData;
}

export default function SingleQuoteIdPage({ quote }: Props) {
  const items = (quote?.items as QuoteItem[]) ?? [];

  return (
    <div className="min-h-screen bg-zinc-50 py-12 px-4 font-sans text-zinc-900">
      {/* WEB-ONLY: Top Action Bar */}
      <div className="max-w-3xl mx-auto mb-6 flex justify-between items-center print:hidden">
        <div className="text-sm font-medium text-zinc-500">
          Prepared for {quote?.customer?.name}
        </div>
        
        {/* Use the Client Component here */}
        <PrintButton />
      </div>

      {/* THE ACTUAL QUOTE / "PAPER" */}
      <div className="max-w-3xl mx-auto bg-white border border-zinc-200 shadow-xl rounded-2xl overflow-hidden print:shadow-none print:border-none print:m-0">
        {/* Header Section */}
        <div className="bg-zinc-900 text-white p-10 flex justify-between items-end">
          <div>
            <h1 className="text-4xl font-black mb-2">HUE-LINE</h1>
            <p className="text-zinc-400 font-medium">Painting Estimate</p>
          </div>
          <div className="text-right">
            <p className="text-xl font-bold">
              ${quote?.totalAmount?.toFixed(2) || "0.00"}
            </p>
            <p className="text-sm text-zinc-400">
              Quote #{quote?.id.slice(-6).toUpperCase()}
            </p>
          </div>
        </div>

        <div className="p-10">
          {/* Proposed Vision */}
          <div className="mb-10">
            <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-4">
              Proposed Vision
            </h3>
            <div className="flex gap-4">
              <div className="flex-1 h-48 bg-zinc-100 rounded-xl overflow-hidden">
                {quote?.booking?.compressOriginalImages && (
                  <img
                    src={quote.booking.compressOriginalImages}
                    className="w-full h-full object-cover"
                    alt="Original"
                  />
                )}
              </div>
            </div>
          </div>

          {/* Line Items Table */}
          <div className="mb-10">
            <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-4">
              Line Items
            </h3>
            <div className="border border-zinc-100 rounded-xl overflow-hidden">
              <table className="w-full text-left text-sm">
                <thead className="bg-zinc-50 text-zinc-500 font-medium border-b border-zinc-100">
                  <tr>
                    <th className="p-4">Description</th>
                    <th className="p-4 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 font-medium">
                  {items.length > 0 ? (
                    items.map((item, i) => (
                      <tr key={i}>
                        <td className="p-4 text-zinc-900">{item.description}</td>
                        <td className="p-4 text-right text-zinc-900">
                          ${typeof item.price === 'number' ? item.price.toFixed(2) : item.price}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={2} className="p-4 text-center text-zinc-500">
                        No items
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* WEB-ONLY: Accept Button */}
        <div className="bg-zinc-50 p-6 border-t border-zinc-100 flex justify-end print:hidden">
          <button className="bg-[#007AFF] text-white px-8 py-3 rounded-xl font-bold shadow-md hover:bg-blue-600 transition-all flex items-center gap-2">
            <CheckCircle className="w-5 h-5" />
            Accept Estimate
          </button>
        </div>
      </div>
    </div>
  );
}