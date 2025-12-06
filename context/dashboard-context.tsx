"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { BookingData, SubdomainAccountData } from "@/types/subdomain-type";

interface DashboardContextType {
  bookings: BookingData[];
  subdomain: SubdomainAccountData;
  isLoading: boolean;
  refreshBookings: () => void;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

interface DashboardProviderProps {
  children: ReactNode;
  initialBookings: BookingData[];
  subdomain: SubdomainAccountData;
}

export function DashboardProvider({
  children,
  initialBookings,
  subdomain,
}: DashboardProviderProps) {
  const [bookings, setBookings] = useState<BookingData[]>(initialBookings);
  const [isLoading, setIsLoading] = useState(true);

  // Function to fetch presigned URLs for a specific booking
  const fetchUrlsForBooking = async (booking: BookingData) => {
    try {
      const res = await fetch(
        `/api/subdomain/${subdomain.slug}/booking/${booking.phone}/get-presigned-urls`
      );
      if (!res.ok) return booking; // Return original if failed
      
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
      console.error(`Failed to enrich booking ${booking.phone}`, e);
      return booking;
    }
  };

  useEffect(() => {
    let isMounted = true;

    const enrichAllBookings = async () => {
      // PERFORMANCE NOTE: If you have 50+ bookings, this fires 50 API calls.
      // Ideally, create a bulk API endpoint: /api/.../get-batch-presigned-urls
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
  }, [subdomain.slug]); // Removed initialBookings to prevent loops if prop reference changes

  return (
    <DashboardContext.Provider 
      value={{ 
        bookings, 
        subdomain, 
        isLoading, 
        refreshBookings: () => setBookings(initialBookings) // Reset/Re-fetch logic
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