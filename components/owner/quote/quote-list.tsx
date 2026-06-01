import { JsonObject } from "@/app/generated/prisma/runtime/library";

export interface QuoteItem extends JsonObject {
  title?: string;
  description: string;
  quantity?: number;
  unit?: string;       // e.g., "Gallons", "Sq Ft", "Hours"
  unitPrice?: number;
  price: number;       // This acts as the Line Total
}

interface QuoteListProps {
  items: QuoteItem[];
  totalAmount: number;
  isOwner?: boolean; // Optional prop to indicate if the viewer is the owner
}

export function QuoteList({ items, totalAmount }: QuoteListProps) {
  // 1. Realistic, professional contracting data
  const fakeItems: QuoteItem[] = [
    {
      title: "Wall Preparation & Patching",
      description: "Sanding, patching minor holes, caulking gaps, and applying premium primer to ensure a smooth surface.",
      quantity: 1,
      unit: "Room",
      unitPrice: 350.00,
      price: 350.00,
    },
    {
      title: "Benjamin Moore Aura® Interior Paint",
      description: "Color: Salamander (2050-10) • Finish: Matte",
      quantity: 3,
      unit: "Gallons",
      unitPrice: 95.00,
      price: 285.00,
    },
    {
      title: "Painting Labor",
      description: "Cut and roll 2 coats to interior walls and edge detailing.",
      quantity: 12,
      unit: "Hours",
      unitPrice: 65.00,
      price: 780.00,
    },
    {
      title: "Consumables & Protection",
      description: "Drop cloths, masking tape, poly plastic, and environmentally responsible disposal.",
      quantity: 1,
      unit: "Kit",
      unitPrice: 85.00,
      price: 85.00,
    },
  ];

  // 2. Use fake data if the real items array is empty
  const displayItems = items?.length > 0 ? items : fakeItems;
  
  // 3. Calculate fake total if we are using fake items
  const displayTotal = items?.length > 0 
    ? totalAmount 
    : fakeItems.reduce((sum, item) => sum + (item.price || 0), 0);

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
            {displayItems.map((item, i) => {
              // Fallbacks for older data that only has 'description' and 'price'
              const qty = item.quantity ?? 1;
              const rate = item.unitPrice ?? item.price;
              const lineTotal = item.price;

              return (
                <tr key={i} className="print:break-inside-avoid hover:bg-zinc-50/50 transition-colors">
                  
                  {/* Item & Description Column */}
                  <td className="p-4 text-zinc-900 align-top">
                    {item.title && (
                      <div className="font-bold mb-1 text-zinc-900">
                        {item.title}
                      </div>
                    )}
                    <div className={`leading-relaxed ${item.title ? 'text-zinc-500 text-xs font-normal' : ''}`}>
                      {item.description}
                    </div>
                  </td>
                  
                  {/* Quantity Column */}
                  <td className="p-4 text-right align-top text-zinc-600">
                    {qty} <span className="text-zinc-400 text-xs">{item.unit || ''}</span>
                  </td>
                  
                  {/* Rate / Unit Price Column */}
                  <td className="p-4 text-right align-top text-zinc-600">
                    ${typeof rate === "number" ? rate.toFixed(2) : rate}
                  </td>

                  {/* Total Column */}
                  <td className="p-4 text-right align-top text-zinc-900 font-semibold">
                    ${typeof lineTotal === "number" ? lineTotal.toFixed(2) : lineTotal}
                  </td>
                  
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      
      {/* Footer Total */}
      <div className="flex justify-end pt-5 pr-4 print:break-inside-avoid">
        <div className="text-right">
          <span className="text-sm text-zinc-500 font-medium mr-4">Total Amount:</span>
          <span className="text-2xl font-black text-zinc-900 tracking-tight">
            ${displayTotal?.toFixed(2) || "0.00"}
          </span>
        </div>
      </div>
    </div>
  );
}