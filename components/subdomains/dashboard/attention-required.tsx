import { AlertTriangle, TrendingUp } from "lucide-react";
import { BookingData } from "@/types/subdomain-type";

export default function AttentionRequired({ bookings }: { bookings: BookingData[] }) {
  // Logic: Find leads with negative outcome OR high value
  const critical = bookings.filter(b => 
    b.estimatedValue && b.estimatedValue > 2000 
  ).slice(0, 3);

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5">
      <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
        <AlertTriangle className="size-4 text-amber-500" />
        Needs Attention
      </h3>
      <div className="space-y-3">
        {critical.map(lead => (
          <div key={lead.id} className="p-3 rounded-lg bg-amber-50/50 border border-amber-100 flex justify-between items-center">
            <div className="min-w-0">
              <p className="text-xs font-bold text-gray-900 truncate">{lead.name}</p>
              <p className="text-[10px] text-amber-700">High Value Prospect</p>
            </div>
            <div className="text-xs font-bold text-amber-700">
              ${lead.estimatedValue?.toLocaleString()}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}