import { BookingData } from "@/types/subdomain-type";

export function StatusDistributor({ bookings }: { bookings: BookingData[] }) {
  const total = bookings.length;
  // Example logic: partition by initial intent
  const estimates = bookings.filter(b => b.initialIntent === 'ESTIMATE').length;
  const general = total - estimates;

  const estPercent = (estimates / total) * 100;

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5">
      <h3 className="font-bold text-gray-900 mb-4 text-sm">Pipeline Mix</h3>
      <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden flex">
        <div style={{ width: `${estPercent}%` }} className="h-full bg-blue-500" />
        <div style={{ width: `${100 - estPercent}%` }} className="h-full bg-zinc-300" />
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2">
        <div className="flex items-center gap-2">
          <div className="size-2 rounded-full bg-blue-500" />
          <span className="text-[10px] text-gray-500 font-medium">Estimates ({estimates})</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="size-2 rounded-full bg-zinc-300" />
          <span className="text-[10px] text-gray-500 font-medium">Other ({general})</span>
        </div>
      </div>
    </div>
  );
}