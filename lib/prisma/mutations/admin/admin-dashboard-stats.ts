import { prisma } from "../../config";

export async function getSuperAdminDashboardStats() {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

  const stats = await prisma.subdomain.findMany({
    include: {
      bookings: {
        include: {
          calls: {
            include: {
              intelligence: true,
            }
          }
        }
      },
      logs: true,
    }
  });

  // Current month active subdomains
  const currentMonthActive = stats.filter(sub => 
    sub.active && new Date(sub.createdAt) <= now
  ).length;

  // Last month active subdomains
  const lastMonthActive = stats.filter(sub => 
    sub.active && new Date(sub.createdAt) <= endOfLastMonth
  ).length;

  // Change in active painters
  const activeChange = currentMonthActive - lastMonthActive;

  // Calculate monthly revenue (sum of plan prices)
  const monthlyRevenue = stats.reduce((sum, sub) => {
    const price = parseFloat(sub.planPrice || '0');
    return sum + price;
  }, 0);

  // Last month's revenue for comparison
  const lastMonthRevenue = stats
    .filter(sub => new Date(sub.createdAt) <= endOfLastMonth)
    .reduce((sum, sub) => {
      const price = parseFloat(sub.planPrice || '0');
      return sum + price;
    }, 0);

  // Revenue percentage change
  const revenueChange = lastMonthRevenue > 0 
    ? ((monthlyRevenue - lastMonthRevenue) / lastMonthRevenue * 100).toFixed(1)
    : "0";

  // Calculate total value found from call intelligence
  const totalValueFound = stats.reduce((sum, sub) => {
    const subdomainValue = sub.bookings.reduce((bookingSum, booking) => {
      const callsValue = booking.calls.reduce((callSum, call) => {
        return callSum + (call.intelligence?.estimatedAdditionalValue || 0);
      }, 0);
      return bookingSum + callsValue;
    }, 0);
    return sum + subdomainValue;
  }, 0);

  // Calculate total calls in last 30 days
  const totalCallsLast30Days = stats.reduce((sum, sub) => {
    const subdomainCalls = sub.bookings.reduce((bookingSum, booking) => {
      const recentCalls = booking.calls.filter(call => 
        new Date(call.createdAt) >= thirtyDaysAgo
      ).length;
      return bookingSum + recentCalls;
    }, 0);
    return sum + subdomainCalls;
  }, 0);

  // Total calls all time
  const totalCallsAllTime = stats.reduce((sum, sub) => {
    const subdomainCalls = sub.bookings.reduce((bookingSum, booking) => {
      return bookingSum + booking.calls.length;
    }, 0);
    return sum + subdomainCalls;
  }, 0);

  return {
    totalActive: currentMonthActive - 1,
    activeChange: activeChange >= 0 ? `+${activeChange}` : `${activeChange}`,
    monthlyRevenue,
    revenueChange: `+${revenueChange}%`,
    totalValueFound,
    totalCallsLast30Days,
    totalCallsAllTime,
    totalSubdomains: stats.length,
  };
}