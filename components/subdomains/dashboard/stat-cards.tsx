import { DashboardStats } from "@/types/dashboard-types";
import { getEstimatedValueRange } from "@/lib/utils/dashboard-utils";
import { Phone, Clock, CalendarDays, TrendingUp, TrendingDown, Minus, DollarSign } from "lucide-react";


export default function StatCards({
  stats,
  isLoading,
}: {
  stats: DashboardStats | undefined;
  isLoading: boolean;
}) {
  if (isLoading) {
    return (
      <section className="container mx-auto max-w-6xl px-4 md:px-10 lg:px-0 my-6">
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
  // const monthTrend = getTrendData(stats?.callsThisMonthTrend);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const cardData = [
    {
      label: "Calls This Week",
      value: stats?.callsThisWeek || 0,
      icon: Phone,
      color: "primary",
      trend: weekTrend.label,
      trendDirection: weekTrend.direction, 
      trendLabel: "vs last week",
    },
    {
      label: "Peak Hour",
      value: stats?.peakHour || "N/A",
      icon: Clock,
      color: "purple",
      trend: "Avg",
      trendDirection: "neutral", 
      trendLabel: "Most active time",
    },
    // {
    //   label: "Calls This Month",
    //   value: stats?.callsThisMonth || 0,
    //   icon: CalendarDays,
    //   color: "emerald",
    //   trend: monthTrend.label,
    //   trendDirection: monthTrend.direction,
    //   trendLabel: "vs last month",
    // },
   {
      label: "Potential Value",
      value: getEstimatedValueRange(stats?.potentialValue || 0),
      icon: DollarSign,
      color: "green",
      trend: `${stats?.pendingCount || 0} pending`,
      trendDirection: "neutral",
      trendLabel: "Active opportunities",
    },
  ];

  

  

  const getColorClasses = (color: string) => {
    switch (color) {
      case "primary": return { text: "text-primary", bg: "bg-none", border: "border-primary" };
      case "purple": return { text: "text-purple-600", bg: "bg-purple-50", border: "border-purple-500" };
      case "green": return { text: "text-green-600", bg: "bg-green-50", border: "border-green-500" };
      default: return { text: "text-gray-600", bg: "bg-gray-50", border: "border-gray-500" };
    }
  };

  return (
    <section className="container mx-auto max-w-7xl px-4 md:px-10 lg:px-0 py-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {cardData.map((item, index) => {
          const colors = getColorClasses(item.color);
          
          return (
            <div
              key={index}
              className={`flex flex-col justify-between relative bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-t-4 ${colors.border} overflow-hidden h-full`}
            >
              {/* Main Content - Flex Grow pushes footer down */}
              <div className="p-6 flex-grow">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-semibold text-gray-500 mb-1 uppercase tracking-wider">
                      {item.label}
                    </p>
                    <h3 className="text-3xl font-bold text-gray-900 tracking-tight mt-2">
                      {item.value}
                    </h3>
                  </div>
                  <div className={`p-3 rounded-xl ${colors.bg} ${colors.text} bg-opacity-50 ring-1 ring-inset ring-black/5`}>
                    <item.icon className="w-6 h-6" />
                  </div>
                </div>
              </div>

              {/* Stats Footer - Distinct separation */}
              <div className="border-t border-gray-100 bg-gray-50 px-6 py-4">
                <div className="flex items-center text-sm">
                  <span className={`
                    inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mr-3
                    ${item.trendDirection === 'up' ? 'bg-green-100 text-green-700' : 
                      item.trendDirection === 'down' ? 'bg-red-100 text-red-700' : 
                      'bg-gray-200 text-gray-700'}
                  `}>
                    {item.trendDirection === 'up' && <TrendingUp className="w-3 h-3 mr-1" />}
                    {item.trendDirection === 'down' && <TrendingDown className="w-3 h-3 mr-1" />}
                    {item.trendDirection === 'neutral' && <Minus className="w-3 h-3 mr-1" />}
                    {item.trend}
                  </span>
                  <span className="text-gray-500 text-xs font-medium">
                    {item.trendLabel}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}