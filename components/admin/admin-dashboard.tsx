"use client";

import {
  Users,
  TrendingUp,
  Activity,
  DollarSign,
  Plus,
  MoreHorizontal,
  PhoneIncoming,
  Image as ImageIcon,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { useSuperAdmin } from "@/context/super-admin-context";

// --- MOCK DATA FOR VISUALIZATION ---
const SYSTEM_HEALTH = "healthy"; // healthy, degraded, down

const RECENT_ACTIVITY = [
  {
    id: 1,
    client: "Prestige Painting",
    action: "Call Received",
    detail: "New Project • Interior (+$2,400)",
    time: "2 min ago",
    icon: PhoneIncoming,
  },
  {
    id: 2,
    client: "Elite Finishes",
    action: "Mockup Generated",
    detail: "Living Room • Hale Navy",
    time: "15 min ago",
    icon: ImageIcon,
  },
  {
    id: 3,
    client: "Color Masters",
    action: "Warm Transfer",
    detail: "Painter Joined Call",
    time: "1 hour ago",
    icon: Users,
  },
  {
    id: 4,
    client: "Pro Coats",
    action: "Subscription",
    detail: "Plan Upgrade ($2,500/mo)",
    time: "2 hours ago",
    icon: DollarSign,
  },
];

export default function AdminDashboard() {
  const {
    isStatsLoading,
    stats,
    refreshStats,
    clients,
    isClientsLoading,
    refreshClients,
    logs,
    isLogsLoading,
  } = useSuperAdmin();

  // Build stats array from context data
  const STATS = [
    {
      label: "Active Painters",
      value: isStatsLoading ? "..." : stats?.totalActive.toString() || "0",
      change: isStatsLoading
        ? "..."
        : `${stats?.activeChange} this month` || "0",
      icon: Users,
    },
    {
      label: "Monthly Revenue (MRR)",
      value: isStatsLoading
        ? "..."
        : `$${stats?.monthlyRevenue.toLocaleString() || "0"}`,
      change: isStatsLoading ? "..." : stats?.revenueChange || "0%",
      icon: DollarSign,
    },
    {
      label: "Total Value Found",
      value: isStatsLoading
        ? "..."
        : `$${stats?.totalValueFound.toLocaleString() || "0"}`,
      change: "Aggregated Opportunity",
      icon: TrendingUp,
      color: "text-green-600",
    },
    {
      label: "Calls Processed",
      value: isStatsLoading
        ? "..."
        : stats?.totalCallsLast30Days.toString() || "0",
      change: "Last 30 days",
      icon: Activity,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 mt-4 md:mt-0 p-4 md:p-8 rounded-2xl">
      {/* 1. HEADER & ACTIONS */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-primary tracking-tight">
            Super Admin
          </h1>
          <p className="text-gray-500 mt-1">
            Overview of all painting clients and system performance.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-white border rounded-full text-xs font-medium text-gray-600 shadow-sm">
            <div
              className={`w-2 h-2 rounded-full ${
                SYSTEM_HEALTH === "healthy" ? "bg-green-500" : "bg-red-500"
              }`}
            />
            Twilio Status
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-white border rounded-full text-xs font-medium text-gray-600 shadow-sm">
            <div
              className={`w-2 h-2 rounded-full ${
                SYSTEM_HEALTH === "healthy" ? "bg-green-500" : "bg-red-500"
              }`}
            />
            LiveKit Status
          </div>

          <Button
            className="bg-gray-900 hover:bg-gray-800 gap-2 hidden md:flex"
            asChild
          >
            <Link href="/intake-form">
              <Plus className="w-4 h-4" />
              New Client
            </Link>
          </Button>

          <Button
            variant="outline"
            size="icon"
            onClick={refreshStats}
            disabled={isStatsLoading}
            title="Refresh Stats"
          >
            <Activity
              className={`w-4 h-4 ${isStatsLoading ? "animate-spin" : ""}`}
            />
          </Button>
        </div>
      </div>

      {/* 2. KPI GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {STATS.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div
              key={i}
              className="border-gray-200 shadow-sm hover:shadow-md transition-shadow bg-card rounded-xl"
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between space-y-0 pb-2">
                  <span className="text-sm font-medium text-gray-500">
                    {stat.label}
                  </span>
                  <Icon
                    className={`w-4 h-4 ${stat.color || "text-gray-400"}`}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  {isStatsLoading ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                      <span className="text-sm text-gray-400">Loading...</span>
                    </div>
                  ) : (
                    <>
                      <div
                        className={`text-2xl font-bold ${
                          stat.color || "text-gray-900"
                        }`}
                      >
                        {stat.value}
                      </div>
                      <p className="text-xs text-gray-400">{stat.change}</p>
                    </>
                  )}
                </div>
              </CardContent>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 3. CLIENT MANAGEMENT TABLE (2/3 Width) */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-gray-200 shadow-sm h-full">
            <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-gray-100/50">
              <div>
                <CardTitle className="text-lg font-bold text-gray-900">
                  Active Clients
                </CardTitle>
                <p className="text-sm text-gray-500">
                  Manage subdomains and subscriptions.
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={refreshClients}
                  disabled={isClientsLoading}
                >
                  {isClientsLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    "Refresh"
                  )}
                </Button>
                {/* <Button variant="outline" size="sm" asChild>
                  <Link href="/clients">View All</Link>
                </Button> */}
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="min-w-full">
                {/* Table Header */}
                <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-gray-50/50 text-xs font-semibold text-gray-500 border-b border-gray-100">
                  <div className="col-span-4">CLIENT / SUBDOMAIN</div>
                  <div className="col-span-2">PLAN</div>
                  <div className="col-span-2">USAGE</div>
                  <div className="col-span-2">VALUE FOUND</div>
                  <div className="col-span-2 text-right">STATUS</div>
                </div>

                {/* Loading State */}
                {isClientsLoading && (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                    <span className="ml-2 text-sm text-gray-500">
                      Loading clients...
                    </span>
                  </div>
                )}

                {/* Empty State */}
                {!isClientsLoading && (!clients || clients.length === 0) && (
                  <div className="flex flex-col items-center justify-center py-12">
                    <Users className="w-12 h-12 text-gray-300 mb-2" />
                    <p className="text-sm text-gray-500">No clients found</p>
                  </div>
                )}

                {/* Client Rows */}
                {!isClientsLoading &&
                  clients &&
                  clients.slice(0, 5).map((client) => (
                    <div
                      key={client.id}
                      className="grid grid-cols-12 gap-4 px-6 py-4 items-center border-b border-gray-100 hover:bg-gray-50/50 transition-colors group"
                    >
                      <div className="col-span-4">
                        <Link href={`clients/${client.slug}`}>
                          <div className="font-medium text-blue-600 hover:text-blue-800 hover:underline">
                            {client.companyName || "Unnamed Company"}
                          </div>
                        </Link>
                        <Link href={client.projectUrl as string}>
                          <div className="text-xs text-gray-400">
                            {client.slug}.hue-line.com
                          </div>
                        </Link>
                      </div>
                      <div className="col-span-2">
                        <Badge variant="outline" className="font-normal">
                          {client.planName}
                        </Badge>
                      </div>
                      <div className="col-span-2 text-sm text-gray-600">
                        {client.totalCalls} calls
                      </div>
                      <div className="col-span-2 text-sm font-bold text-green-600">
                        +${client.totalValueFound.toLocaleString()}
                      </div>
                      <div className="col-span-2 flex justify-end">
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-2 h-2 rounded-full ${
                              client.active ? "bg-green-500" : "bg-red-500"
                            }`}
                          />
                          <span className="text-xs text-gray-600">
                            {client.active ? "Active" : "Inactive"}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 4. LIVE INTELLIGENCE FEED (1/3 Width) */}
        <div className="space-y-6">
          <Card className="border-gray-200 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Activity className="w-5 h-5 text-blue-600" />
                Global Live Feed
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-gray-100">
                {isLogsLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                    <span className="ml-2 text-sm text-gray-500">
                      Loading Logs...
                    </span>
                  </div>
                ) : logs && logs.length > 0 ? (
                  logs.map((log) => (
                    <div
                      key={log.id}
                      className="p-4 flex gap-3 hover:bg-gray-50/50 transition-colors"
                    >
                      <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                        {/* Add your icon logic based on log.type */}
                        <Activity className="w-4 h-4 text-gray-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                          <p className="text-sm font-medium text-primary">
                            {log.subdomain?.companyName || "Unknown Client"}
                          </p>
                         
                          <span className="text-[10px] text-gray-400">
                            {new Date(log.createdAt).toLocaleTimeString()}
                          </span>
                        </div>
                         <p className="text-sm font-medium text-gray-900">
                            {log.title}
                          </p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {log.type} • {log.actor}
                        </p>
                        {log.description && (
                          <p className="text-xs font-medium text-gray-700 mt-1 truncate">
                            {log.description}
                          </p>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-center text-sm text-gray-500">
                    No logs available
                  </div>
                )}
              </div>
              <div className="p-4 border-t border-gray-100 bg-gray-50/50 text-center">
                <Button
                  variant="link"
                  className="text-xs text-gray-500 h-auto p-0"
                  asChild
                >
                  <Link href="/logs">View System Logs &rarr;</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
