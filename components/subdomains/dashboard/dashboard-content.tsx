// components/subdomains/dashboard/dashboard-content.tsx
"use client";

import { useDashboard } from "@/context/dashboard-context";
import SubdomainNav from "../layout/subdomain-nav";
import ClientTable from "./client-table";
import StatCards from "./stat-cards";

export default function DashboardContent() {
  const { subdomain, stats, isStatsLoading } = useDashboard();
  
  return (
    <div>
      <SubdomainNav data={subdomain} />
      <StatCards stats={stats} isLoading={isStatsLoading} />
      <ClientTable />
    </div>
  );
}