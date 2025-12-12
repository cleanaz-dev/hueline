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
  
  const lastMonthStart = startOfMonth(subMonths(now, 1));
  const lastMonthEnd = endOfMonth(subMonths(now, 1));

  const callsThisMonth = allBookings.filter(
    b => b.createdAt >= thisMonthStart
  ).length;

  const callsLastMonth = allBookings.filter(
    b => b.createdAt >= lastMonthStart && b.createdAt <= lastMonthEnd
  ).length;

  // --- 3. Peak Hour Logic (FIXED) ---
  // Get bookings from this month to find the busiest hour of day
  const thisMonthBookings = allBookings.filter(
    b => b.createdAt >= thisMonthStart
  );

  // Count calls by hour of day (0-23) across all days this month
  const hourCounts: Record<number, number> = {};
  
  thisMonthBookings.forEach(booking => {
    const hour = booking.createdAt.getHours();
    hourCounts[hour] = (hourCounts[hour] || 0) + 1;
  });

  // Find the hour with the most calls
  let peakHourNum = 0;
  let maxCalls = 0;

  Object.entries(hourCounts).forEach(([hour, count]) => {
    if (count > maxCalls) {
      maxCalls = count;
      peakHourNum = parseInt(hour);
    }
  });

  // Format the peak hour as an interval (e.g., "1 PM - 2 PM")
  let peakHour = "N/A";
  if (maxCalls > 0) {
    const startPeriod = peakHourNum >= 12 ? 'PM' : 'AM';
    const startDisplayHour = peakHourNum === 0 ? 12 : peakHourNum > 12 ? peakHourNum - 12 : peakHourNum;
    
    const endHourNum = (peakHourNum + 1) % 24; // Next hour (wraps at midnight)
    const endPeriod = endHourNum >= 12 ? 'PM' : 'AM';
    const endDisplayHour = endHourNum === 0 ? 12 : endHourNum > 12 ? endHourNum - 12 : endHourNum;
    
    peakHour = `${startDisplayHour} ${startPeriod} - ${endDisplayHour} ${endPeriod}`;
  }

  // --- 4. Helper for Percentage Math ---
  const calculateTrend = (current: number, previous: number) => {
    if (previous === 0) {
      return current > 0 ? 100 : 0;
    }
    const percent = ((current - previous) / previous) * 100;
    return Math.round(percent);
  };

  return {
    callsThisWeek,
    callsThisWeekTrend: calculateTrend(callsThisWeek, callsLastWeek),
    
    callsThisMonth,
    callsThisMonthTrend: calculateTrend(callsThisMonth, callsLastMonth),
    
    peakHour,
  };
}