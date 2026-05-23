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
  const [isLoading, setIsLoading] = useState(true);

  const [selectedBooking, setSelectedBooking] = useState<ExtendedBookingData | null>(null);
  const [isIntelOpen, setIsIntelOpen] = useState(false);

  const { data: stats, isLoading: isStatsLoading } = useSWR<DashboardStats>(
    `/api/subdomain/${subdomain.slug}/stats`,
    fetcher
  );

  useEffect(() => {
    let isMounted = true;

    const enrichAllBookings = async () => {
      const keysToSign = new Set<string>();
      
      initialBookings.forEach((b) => {
        if (b.compressOriginalImages) keysToSign.add(b.compressOriginalImages);
        
        // ✨ Look! No more (b as any)! TypeScript knows mockups exists!
        if (Array.isArray(b.mockups)) {
          b.mockups.forEach((m) => {
            if (m.compressedS3Key) keysToSign.add(m.compressedS3Key);
          });
        }
      });

      const keysArray = Array.from(keysToSign);
      let urlMap: Record<string, string> = {};

      if (keysArray.length > 0) {
        try {
          const res = await fetch('/api/s3/bulk-presign', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ keys: keysArray })
          });
          
          if (res.ok) {
            const data = await res.json();
            urlMap = data.urls || {}; 
          }
        } catch (e) {
          console.error("Failed to fetch bulk presigned urls", e);
        }
      }

      if (isMounted) {
        const enriched = initialBookings.map((b) => ({
          ...b,
          originalImages: b.compressOriginalImages && urlMap[b.compressOriginalImages]
            ? urlMap[b.compressOriginalImages]
            : b.originalImages,
            
          // ✨ Clean mapping, completely type-safe
          mockups: b.mockups.map((m) => ({
            ...m,
            presignedUrl: m.compressedS3Key && urlMap[m.compressedS3Key]
              ? urlMap[m.compressedS3Key]
              : m.presignedUrl
          })),
        }));

        const sorted = enriched.sort((a, b) => {
          const dateA = new Date(a.lastCallAt || a.createdAt).getTime();
          const dateB = new Date(b.lastCallAt || b.createdAt).getTime();
          return dateB - dateA; 
        });

        setBookings(sorted);
        setIsLoading(false);
      }
    };

    enrichAllBookings();

    return () => {
      isMounted = false;
    };
  }, [initialBookings]);

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