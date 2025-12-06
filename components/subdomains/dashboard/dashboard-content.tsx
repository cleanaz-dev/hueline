// components/subdomains/dashboard/dashboard-content.tsx
"use client";

import { useDashboard } from "@/context/dashboard-context";
import SubdomainNav from "../layout/subdomain-nav";
import ClientTable from "./client-table";

export default function DashboardContent() {
  // 3. Access the data (which might be loading or fully enriched)
  const { bookings, subdomain, isLoading } = useDashboard();

  return (
    <div>
      <SubdomainNav data={subdomain}/>
      
      {/* 
         You can choose to show a loader here, 
         or pass the bookings (which start as server data) immediately 
         and they will "pop" in with images once the fetch finishes.
      */}
      <ClientTable 
      />
    </div>
  )
}