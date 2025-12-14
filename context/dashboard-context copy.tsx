"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import useSWR from "swr";
import { BookingData, SubdomainAccountData } from "@/types/subdomain-type";
import { DashboardStats } from "@/types/dashboard-types";



interface DashboardContextType {
  bookings: BookingData[];
  subdomain: SubdomainAccountData;
  stats: DashboardStats | undefined;
  isLoading: boolean;
  isStatsLoading: boolean;
  refreshBookings: () => void;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

interface DashboardProviderProps {
  children: ReactNode;
  initialBookings: BookingData[];
  subdomain: SubdomainAccountData;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function DashboardProvider({
  children,
  initialBookings,
  subdomain,
}: DashboardProviderProps) {
  const [bookings, setBookings] = useState<BookingData[]>(initialBookings);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch stats with SWR
  const { data: stats, isLoading: isStatsLoading } = useSWR<DashboardStats>(
    `/api/subdomain/${subdomain.slug}/stats`,
    fetcher
  );

  // Function to fetch presigned URLs for a specific booking
  const fetchUrlsForBooking = async (booking: BookingData) => {
    try {
      const res = await fetch(
        `/api/subdomain/${subdomain.slug}/booking/${booking.huelineId}/get-presigned-urls`
      );
      if (!res.ok) return booking;
      
      const { originalImages, mockups } = await res.json();
      
      return {
        ...booking,
        originalImages,
        mockups: mockups.map((mockup: any, index: number) => ({
          ...(booking.mockups ? booking.mockups[index] : {}),
          ...mockup,
        })),
      };
    } catch (e) {
      console.error(`Failed to enrich booking ${booking.huelineId}`, e);
      return booking;
    }
  };

  useEffect(() => {
    let isMounted = true;

    const enrichAllBookings = async () => {
      const promises = initialBookings.map((b) => fetchUrlsForBooking(b));
      
      const enriched = await Promise.all(promises);

      if (isMounted) {
        setBookings(enriched);
        setIsLoading(false);
      }
    };

    enrichAllBookings();

    return () => {
      isMounted = false;
    };
  }, [subdomain.slug]);

  return (
    <DashboardContext.Provider 
      value={{ 
        bookings, 
        subdomain,
        stats,
        isLoading,
        isStatsLoading,
        refreshBookings: () => setBookings(initialBookings)
      }}
    >
      {children}
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