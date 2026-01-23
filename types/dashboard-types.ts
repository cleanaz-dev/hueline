// types/dashboard.ts (create this file)
export interface DashboardStats {
  callsThisWeek: number;
  callsThisWeekTrend: number;
  callsThisMonth: number;
  callsThisMonthTrend: number;
  peakHour: string;
  potentialValue: number;
  pendingCount: number;
}