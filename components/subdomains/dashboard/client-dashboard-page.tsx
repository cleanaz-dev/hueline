// components/subdomains/dashboard/client-dashboard-page.tsx
"use client";

import {SubdomainAccountData } from "@/types/subdomain-type";
import { DashboardProvider, ExtendedBookingData } from "@/context/dashboard-context";
import DashboardContent from "@/components/subdomains/dashboard/dashboard-content";
import { SubBookingData } from "@/app/generated/prisma";


interface Props {
  bookingData: ExtendedBookingData[]
  accountData: SubdomainAccountData
}

export default function SubdomainDashboardPage({bookingData, accountData}: Props) {
  return (
    // 1. Initialize the Provider with Server Data
    <DashboardProvider initialBookings={bookingData} subdomain={accountData}>
      {/* 2. Render the content which can now use the hook */}
      <DashboardContent />
    </DashboardProvider>
  )
}