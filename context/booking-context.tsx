"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { BookingData, SubdomainAccountData } from "@/types/subdomain-type";

interface BookingContextType {
  booking: BookingData;
  subdomain: SubdomainAccountData;
  isLoading: boolean;
  error: string | null;
  isShareDialogOpen: boolean;
  setIsShareDialogOpen: (open: boolean) => void;
}

const BookingContext = createContext<BookingContextType | undefined>(undefined);

export function BookingProvider({
  children,
  initialBooking,
  subdomain,
}: {
  children: ReactNode;
  initialBooking: BookingData;
  subdomain: SubdomainAccountData;
}) {
  const [booking, setBooking] = useState<BookingData>(initialBooking);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const fetchPresignedUrls = async () => {
      try {
        const res = await fetch(
          `/api/subdomain/${subdomain.slug}/booking/${initialBooking.huelineId}/get-presigned-urls`
        );

        if (!res.ok) {
           console.error("Fetch failed");
           if (isMounted) setIsLoading(false);
           return;
        }

        const { originalImages, mockups } = await res.json();

        const enrichedBooking = {
          ...initialBooking,
          originalImages,
          mockups: mockups.map((mockup: any, index: number) => ({
            ...(initialBooking.mockups ? initialBooking.mockups[index] : {}),
            ...mockup,
          })),
        };

        if (isMounted) {
          setBooking(enrichedBooking);
          setIsLoading(false);
        }
      } catch (err) {
        console.error("Error loading images:", err);
        if (isMounted) {
          setError("Failed to load images");
          setIsLoading(false);
        }
      }
    };

    fetchPresignedUrls();

    return () => { isMounted = false; };
  }, [subdomain.slug]);

  return (
    <BookingContext.Provider value={{ 
      booking, 
      subdomain, 
      isLoading, 
      error,
      isShareDialogOpen,
      setIsShareDialogOpen
    }}>
      {children}
    </BookingContext.Provider>
  );
}

export function useBooking() {
  const context = useContext(BookingContext);
  if (!context) throw new Error("useBooking must be used within a BookingProvider");
  return context;
}