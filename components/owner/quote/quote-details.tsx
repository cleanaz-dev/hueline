import { Mail, Phone, Calendar } from "lucide-react";
import { QuoteData } from "@/lib/prisma/queries/quote/get-quote";

// 1. We define exactly what this component needs from the customer
interface CustomerInfo {
  name?: string | null;
  email?: string | null;
  phone?: string | null;
}

// 2. We can also neatly define the paint colors while we are at it!
interface PaintColorInfo {
  id: string;
  name: string;
  hex: string | null;
  brand: string | null;
  code: string | null;
}

interface QuoteDetailsProps {
  quote: QuoteData;
  companyName: string;
  customer: CustomerInfo | null | undefined; // Now it accepts the simplified object!
  paintColors: PaintColorInfo[] | any[]; 
}

export function QuoteDetails({
  quote,
  companyName,
  customer,
  paintColors,
}: QuoteDetailsProps) {
  const formatBrand = (brandStr: string | null) => {
    if (!brandStr) return "";
    return brandStr
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  return (
    <>
      {/* Header Section */}
      <div className="bg-white p-10 border-b border-zinc-200 flex flex-col md:flex-row justify-between items-start md:items-end print:p-8 print:break-inside-avoid">
        <div className="mb-6 md:mb-0">
          <h1 className="text-4xl font-black mb-2 tracking-tight text-zinc-900">
            {companyName}
          </h1>
          <p className="text-zinc-400 font-bold uppercase tracking-widest text-xs print:text-zinc-500">
            Painting Estimate
          </p>
        </div>
        <div className="text-left md:text-right">
          <p className="text-3xl font-bold mb-1 text-zinc-900">
            ${quote?.totalAmount?.toFixed(2) || "0.00"}
          </p>
          <p className="text-sm text-zinc-400 font-mono print:text-zinc-500">
            QUOTE #{(quote?.id || "").slice(-6).toUpperCase()}
          </p>
        </div>
      </div>

      {/* Wrapping the top half of the inner content (Customer + Colors) */}
      <div className="px-10 pt-10 print:px-8 print:pt-8">
        {/* Customer & Date Info */}
        <div className="flex flex-col md:flex-row justify-between gap-8 mb-12 print:mb-8 print:break-inside-avoid">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-3 print:text-zinc-500">
              Prepared For
            </h3>
            <p className="font-bold text-lg text-zinc-900 mb-1">
              {customer?.name || "Valued Customer"}
            </p>
            {customer?.email && (
              <p className="text-sm text-zinc-600 flex items-center gap-2 mb-1">
                <Mail className="w-4 h-4 text-zinc-400" /> {customer.email}
              </p>
            )}
            {customer?.phone && (
              <p className="text-sm text-zinc-600 flex items-center gap-2">
                <Phone className="w-4 h-4 text-zinc-400" /> {customer.phone}
              </p>
            )}
          </div>
          <div className="md:text-right">
            <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-3 print:text-zinc-500">
              Estimate Date
            </h3>
            <p className="text-sm text-zinc-600 flex items-center md:justify-end gap-2">
              <Calendar className="w-4 h-4 text-zinc-400" />
              {new Date(quote?.createdAt || new Date()).toLocaleDateString(
                "en-US",
                {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                }
              )}
            </p>
          </div>
        </div>

        {/* Color Palette */}
        {paintColors.length > 0 && (
          <div className="mb-12 print:mb-8 print:break-inside-avoid">
            <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-4 print:text-zinc-500 print:break-after-avoid">
              Color Palette
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {paintColors.map((color) => (
                <div
                  key={color.id}
                  className="flex items-center gap-4 bg-zinc-50 p-4 rounded-xl border border-zinc-100 print:bg-white print:border-zinc-300 print:shadow-sm print:break-inside-avoid"
                >
                  <div
                    className="w-12 h-12 rounded-full border border-zinc-200 shadow-inner shrink-0"
                    style={{
                      backgroundColor: color.hex || "#ccc",
                      printColorAdjust: "exact",
                    }}
                  />
                  <div>
                    <p className="font-bold text-sm text-zinc-900">
                      {color.name}
                    </p>
                    <p className="text-xs text-zinc-500 font-medium">
                      {formatBrand(color.brand)} • {color.code}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}