"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import useSWR from "swr";
import { BookingData, SubdomainAccountData } from "@/types/subdomain-type";
import { DashboardStats } from "@/types/dashboard-types";
import IntelligenceDialog from "@/components/subdomains/dashboard/intelligence-dialog";

interface DashboardContextType {
  bookings: BookingData[];
  subdomain: SubdomainAccountData;
  stats: DashboardStats | undefined;
  isLoading: boolean;
  isStatsLoading: boolean;
  refreshBookings: () => void;
  
  // NEW: Global Dialog Actions
  openIntelligence: (booking: BookingData) => void;
  closeIntelligence: () => void;
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

  // --- GLOBAL DIALOG STATE ---
  const [selectedBooking, setSelectedBooking] = useState<BookingData | null>(null);
  const [isIntelOpen, setIsIntelOpen] = useState(false);

  // Fetch stats with SWR
  const { data: stats, isLoading: isStatsLoading } = useSWR<DashboardStats>(
    `/api/subdomain/${subdomain.slug}/stats`,
    fetcher
  );

  // Helper to fetch images (Keeping this logic here is fine)
  const fetchUrlsForBooking = async (booking: BookingData) => {
  try {
    const res = await fetch(
      `/api/subdomain/${subdomain.slug}/booking/${booking.huelineId}/get-presigned-urls`
    );
    
    // Safety check: if API errors, return booking as-is without crashing
    if (!res.ok) {
      console.warn(`API Error for ${booking.huelineId}: ${res.status}`);
      return booking;
    }
    
    const data = await res.json();
    
    // Safety check: ensure we actually got the arrays we expect
    const originalImages = Array.isArray(data.originalImages) ? data.originalImages : [];
    const newMockups = Array.isArray(data.mockups) ? data.mockups : [];
    
    return {
      ...booking,
      // If the API returns presigned URLs for original images, update them. 
      // Note: Depending on your Type definition, this might need to remain S3 keys 
      // or you might need a new field like 'originalImageUrls'. 
      // For now, assuming your UI handles URLs in this field:
      originalImages: originalImages.length > 0 ? originalImages : booking.originalImages,
      
      // Merge mockups safer
      mockups: newMockups.map((mockup: any) => {
        // Find existing mockup data if needed, or just use the fresh API data
        const existing = booking.mockups?.find(m => m.id === mockup.id) || {};
        return {
          ...existing,
          ...mockup, 
        };
      }),
    };
  } catch (e) {
    console.error(`Failed to enrich booking ${booking.huelineId}`, e);
    return booking;
  }
};
  useEffect(() => {
    let isMounted = true;

    const enrichAllBookings = async () => {
      // 1. Fetch Images
      const promises = initialBookings.map((b) => fetchUrlsForBooking(b));
      const enriched = await Promise.all(promises);

      if (isMounted) {
        // 2. Sort by "Last Active" (using our new DB field)
        const sorted = enriched.sort((a, b) => {
          const dateA = new Date(a.lastCallAt || a.createdAt).getTime();
          const dateB = new Date(b.lastCallAt || b.createdAt).getTime();
          return dateB - dateA; // Newest first
        });

        setBookings(sorted);
        setIsLoading(false);
      }
    };

    enrichAllBookings();

    return () => {
      isMounted = false;
    };
  }, [subdomain.slug]);

  // Actions
  const openIntelligence = (booking: BookingData) => {
    setSelectedBooking(booking);
    setIsIntelOpen(true);
  };

  const closeIntelligence = () => {
    setIsIntelOpen(false);
    // Small timeout to clear data after animation creates a smoother close
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

      {/* RENDER DIALOG GLOBALLY HERE */}
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