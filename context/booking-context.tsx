"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { BookingData, SubdomainAccountData } from "@/types/subdomain-type";

interface BookingContextType {
  booking: BookingData;
  subdomain: SubdomainAccountData;
  isLoading: boolean;
  error: string | null;
}

const BookingContext = createContext<BookingContextType | undefined>(undefined);

interface BookingProviderProps {
  children: ReactNode;
  initialBooking: BookingData;
  subdomain: SubdomainAccountData;
}

export function BookingProvider({
  children,
  initialBooking,
  subdomain,
}: BookingProviderProps) {
  const [booking, setBooking] = useState<BookingData>(initialBooking);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchPresignedUrls = async () => {
      try {
        // Only fetch if we suspect we don't have presigned URLs yet
        // You can add a check here if (booking.mockups[0].presignedUrl) return; 
        
        const res = await fetch(
          `/api/subdomain/${subdomain.slug}/booking/${initialBooking.huelineId}/get-presigned-urls`
        );

        if (!res.ok) throw new Error("Failed to fetch URLs");

        const { originalImages, mockups } = await res.json();

        if (isMounted) {
          setBooking((prev) => ({
            ...prev,
            originalImages, // Update original images with presigned
            // Merge existing mockup data with new presigned URLs
            mockups: mockups.map((mockup: any, index: number) => ({
              ...(prev.mockups ? prev.mockups[index] : {}),
              ...mockup, // Assuming this contains the presignedUrl
            })),
          }));
          setIsLoading(false);
        }
      } catch (err) {
        console.error("Failed to load presigned URLs:", err);
        if (isMounted) {
          setError("Failed to load images");
          setIsLoading(false); // We stop loading even on error to show the page
        }
      }
    };

    fetchPresignedUrls();

    return () => {
      isMounted = false;
    };
  }, [initialBooking.huelineId, subdomain.slug]);

  return (
    <BookingContext.Provider value={{ booking, subdomain, isLoading, error }}>
      {children}
    </BookingContext.Provider>
  );
}

// Custom hook for easy access
export function useBooking() {
  const context = useContext(BookingContext);
  if (context === undefined) {
    throw new Error("useBooking must be used within a BookingProvider");
  }
  return context;
}