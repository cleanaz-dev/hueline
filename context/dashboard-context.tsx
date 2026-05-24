"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import useSWR from "swr";
import { SubdomainAccountData } from "@/types/subdomain-type";
import { DashboardStats } from "@/types/dashboard-types";
import IntelligenceDialog from "@/components/subdomains/dashboard/intelligence-dialog";
// 1. Import Prisma namespace
import { Prisma } from "@/app/generated/prisma";

// 2. 🔥 Create the REAL Prisma Type that includes all the nested data you need!
export type ExtendedBookingData = Prisma.SubBookingDataGetPayload<{
  include: {
    mockups: true;
    rooms: true;
    calls: {
      include: { intelligence: true }
    };
  }
}>;

interface DashboardContextType {
  bookings: ExtendedBookingData[]; // <-- Updated
  subdomain: SubdomainAccountData;
  stats: DashboardStats | undefined;
  isLoading: boolean;
  isStatsLoading: boolean;
  refreshBookings: () => void;
  openIntelligence: (booking: ExtendedBookingData) => void; // <-- Updated
  closeIntelligence: () => void;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

interface DashboardProviderProps {
  children: ReactNode;
  initialBookings: ExtendedBookingData[]; // <-- Updated
  subdomain: SubdomainAccountData;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function DashboardProvider({
  children,
  initialBookings,
  subdomain,
}: DashboardProviderProps) {
  const [bookings, setBookings] = useState<ExtendedBookingData[]>(initialBookings);
  const [isLoading, setIsLoading] = useState(false);

  const [selectedBooking, setSelectedBooking] = useState<ExtendedBookingData | null>(null);
  const [isIntelOpen, setIsIntelOpen] = useState(false);

  const { data: stats, isLoading: isStatsLoading } = useSWR<DashboardStats>(
    `/api/subdomain/${subdomain.slug}/stats`,
    fetcher
  );

 

  const openIntelligence = (booking: ExtendedBookingData) => {
    setSelectedBooking(booking);
    setIsIntelOpen(true);
  };

  const closeIntelligence = () => {
    setIsIntelOpen(false);
    setTimeout(() => setSelectedBooking(null), 300);
  };

  return (
    <DashboardContext.Provider 
      value={{ 
        bookings, 
        subdomain,
        stats,
        isLoading,
        isStatsLoading,
        refreshBookings: () => setBookings(initialBookings),
        openIntelligence,
        closeIntelligence
      }}
    >
      {children}
      {selectedBooking && (
        <IntelligenceDialog 
          isOpen={isIntelOpen} 
          onClose={closeIntelligence} 
          booking={selectedBooking} 
        />
      )}
    </DashboardContext.Provider>
  );
}

export function useDashboard() {
  const context = useContext(DashboardContext);
  if (context === undefined) {
    throw new Error("useDashboard must be used within a DashboardProvider");
  }
  return context;
}