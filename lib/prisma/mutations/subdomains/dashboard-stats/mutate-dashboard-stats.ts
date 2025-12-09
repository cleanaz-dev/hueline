import { prisma } from "@/lib/prisma";
import { DashboardStats } from "@/types/dashboard-types";
import { 
  startOfWeek, 
  endOfWeek, 
  subWeeks, 
  startOfMonth, 
  endOfMonth, 
  subMonths 
} from "date-fns";

export async function mutateDashboardStats(slug: string): Promise<DashboardStats> {
  const subdomain = await prisma.subdomain.findUnique({
    where: { slug },
    select: {
      bookings: {
        select: {
          createdAt: true
        }
      }
    }
  });

  if (!subdomain) {
    throw new Error("Subdomain not found");
  }

  const now = new Date();
  const allBookings = subdomain.bookings;

  // --- 1. Weekly Stats & Trend ---
  const thisWeekStart = startOfWeek(now);
  
  // Previous week window
  const lastWeekStart = startOfWeek(subWeeks(now, 1));
  const lastWeekEnd = endOfWeek(subWeeks(now, 1));

  const callsThisWeek = allBookings.filter(
    b => b.createdAt >= thisWeekStart
  ).length;

  const callsLastWeek = allBookings.filter(
    b => b.createdAt >= lastWeekStart && b.createdAt <= lastWeekEnd
  ).length;

  // --- 2. Monthly Stats & Trend ---
  const thisMonthStart = startOfMonth(now);
  
  // Previous month window
  const lastMonthStart = startOfMonth(subMonths(now, 1));
  const lastMonthEnd = endOfMonth(subMonths(now, 1));

  const callsThisMonth = allBookings.filter(
    b => b.createdAt >= thisMonthStart
  ).length;

  const callsLastMonth = allBookings.filter(
    b => b.createdAt >= lastMonthStart && b.createdAt <= lastMonthEnd
  ).length;

  // --- 3. Peak Hour Logic (Unchanged) ---
  const hours = allBookings.map(b => b.createdAt.getHours());
  const hourCounts: Record<number, number> = {};
  hours.forEach(h => {
    hourCounts[h] = (hourCounts[h] || 0) + 1;
  });
  
  const peakHourNum = Number(Object.entries(hourCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 0);
  
  // Format to 12-hour with AM/PM
  const period = peakHourNum >= 12 ? 'PM' : 'AM';
  const displayHour = peakHourNum === 0 ? 12 : peakHourNum > 12 ? peakHourNum - 12 : peakHourNum;
  const peakHour = `${displayHour}:00 ${period}`;

  // --- 4. Helper for Percentage Math ---
  const calculateTrend = (current: number, previous: number) => {
    if (previous === 0) {
      // If we have current calls but 0 previous, it's a 100% increase (or technically infinite)
      return current > 0 ? 100 : 0;
    }
    // Calculate percentage difference
    const percent = ((current - previous) / previous) * 100;
    return Math.round(percent); // Return round number, e.g., 12 not 12.435
  };

  return {
    callsThisWeek,
    callsThisWeekTrend: calculateTrend(callsThisWeek, callsLastWeek),
    
    callsThisMonth,
    callsThisMonthTrend: calculateTrend(callsThisMonth, callsLastMonth),
    
    peakHour,
    // Peak hour usually doesn't have a numeric "trend", 
    // but you could return the total calls during that hour if you wanted.
  };
}