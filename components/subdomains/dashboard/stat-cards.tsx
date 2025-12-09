import { DashboardStats } from "@/types/dashboard-types";
import { Phone, Clock, CalendarDays, TrendingUp, TrendingDown, Minus } from "lucide-react";


export default function StatCards({
  stats,
  isLoading,
}: {
  stats: DashboardStats | undefined;
  isLoading: boolean;
}) {
  if (isLoading) {
    return (
      <section className="container mx-auto max-w-6xl px-4 md:px-10 lg:px-0 my-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm animate-pulse">
              <div className="h-4 bg-gray-100 rounded w-24 mb-4"></div>
              <div className="h-8 bg-gray-100 rounded w-16 mb-4"></div>
              <div className="h-4 bg-gray-100 rounded w-32"></div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  // 2. Helper to format the raw number into UI data
  const getTrendData = (value: number | undefined) => {
    if (value === undefined) return { label: "0%", direction: "neutral" };
    
    if (value > 0) return { label: `+${value}%`, direction: "up" };
    if (value < 0) return { label: `${value}%`, direction: "down" };
    return { label: "0%", direction: "neutral" };
  };

  const weekTrend = getTrendData(stats?.callsThisWeekTrend);
  const monthTrend = getTrendData(stats?.callsThisMonthTrend);

  const cardData = [
    {
      label: "Calls This Week",
      value: stats?.callsThisWeek || 0,
      icon: Phone,
      color: "blue",
      // Connect real data
      trend: weekTrend.label,
      trendDirection: weekTrend.direction, 
      trendLabel: "vs last week",
    },
    {
      label: "Peak Hour",
      value: stats?.peakHour || "N/A",
      icon: Clock,
      color: "purple",
      // Peak hour usually doesn't have a % trend, keep neutral
      trend: "Avg",
      trendDirection: "neutral", 
      trendLabel: "Most active time",
    },
    {
      label: "Calls This Month",
      value: stats?.callsThisMonth || 0,
      icon: CalendarDays,
      color: "emerald",
      // Connect real data
      trend: monthTrend.label,
      trendDirection: monthTrend.direction,
      trendLabel: "vs last month",
    },
  ];

  const getColorClasses = (color: string) => {
    switch (color) {
      case "blue": return { text: "text-blue-600", bg: "bg-blue-50", border: "border-blue-500" };
      case "purple": return { text: "text-purple-600", bg: "bg-purple-50", border: "border-purple-500" };
      case "emerald": return { text: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-500" };
      default: return { text: "text-gray-600", bg: "bg-gray-50", border: "border-gray-500" };
    }
  };

  return (
    <section className="container mx-auto max-w-6xl px-4 md:px-10 lg:px-0 my-12">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {cardData.map((item, index) => {
          const colors = getColorClasses(item.color);
          
          return (
            <div
              key={index}
              className={`relative bg-white border border-gray-200/60 rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 border-t-4 ${colors.border}`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-semibold text-gray-500 mb-1">
                    {item.label}
                  </p>
                  <h3 className="text-3xl font-bold text-gray-900 tracking-tight">
                    {item.value}
                  </h3>
                </div>
                <div className={`p-3 rounded-lg ${colors.bg} ${colors.text} bg-opacity-50`}>
                  <item.icon className="w-5 h-5" />
                </div>
              </div>

              <div className="mt-4 flex items-center text-sm">
                <span className={`
                  inline-flex items-center px-2 py-0.5 rounded text-xs font-medium mr-2
                  ${item.trendDirection === 'up' ? 'bg-green-100 text-green-700' : 
                    item.trendDirection === 'down' ? 'bg-red-100 text-red-700' : 
                    'bg-gray-100 text-gray-700'}
                `}>
                  {/* Dynamic Icons based on direction */}
                  {item.trendDirection === 'up' && <TrendingUp className="w-3 h-3 mr-1" />}
                  {item.trendDirection === 'down' && <TrendingDown className="w-3 h-3 mr-1" />}
                  {item.trendDirection === 'neutral' && <Minus className="w-3 h-3 mr-1" />}
                  {item.trend}
                </span>
                <span className="text-gray-400 text-xs">
                  {item.trendLabel}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}