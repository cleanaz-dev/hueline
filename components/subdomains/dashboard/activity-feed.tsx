import { BookingData } from "@/types/subdomain-type";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";

export default function ActivityFeed({ bookings }: { bookings: BookingData[] }) {
  // Just show the latest 8 interactions
  const recentBookings = bookings.slice(0, 8);

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
      <div className="p-5 border-b border-gray-100 flex justify-between items-center">
        <h3 className="font-bold text-gray-900">Live Pulse</h3>
        <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
          Live Updates
        </span>
      </div>
      <div className="divide-y divide-gray-50">
        {recentBookings.map((booking) => (
          <div key={booking.id} className="p-4 hover:bg-gray-50/50 transition-colors flex items-start gap-4">
            <Avatar className="h-9 w-9 border border-gray-100">
              <AvatarFallback className="bg-zinc-50 text-zinc-500 text-xs">
                {booking.name.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-start">
                <p className="text-sm font-semibold text-gray-900 truncate">{booking.name}</p>
                <span className="text-[10px] text-gray-400">
                  {booking.lastCallAt ? formatDistanceToNow(new Date(booking.lastCallAt)) + " ago" : "New"}
                </span>
              </div>
              {/* THE PULSE FIELD */}
              <p className="text-xs text-gray-600 mt-0.5 line-clamp-1 italic">
                "{booking.lastInteraction || "No recent activity logged"}"
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}