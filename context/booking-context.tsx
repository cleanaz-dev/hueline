"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { BookingData, SubdomainAccountData } from "@/types/subdomain-type";
import { Job } from "@/app/generated/prisma";
import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface BookingContextType {
  booking: BookingData;
  subdomain: SubdomainAccountData;
  isLoading: boolean;
  error: string | null;
  isShareDialogOpen: boolean;
  setIsShareDialogOpen: (open: boolean) => void;
  isExportDialogOpen: boolean;
  setIsExportDialogOpen: (open: boolean) => void;
  // job tracking
  activeImagenJob: Job | null;
  hasActiveImagenJob: boolean;
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
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);

  // SWR handles polling, focus revalidation, and network recovery automatically
  const { data: jobData } = useSWR<{ job: Job | null }>(
    `/api/subdomain/${subdomain.slug}/booking/${initialBooking.huelineId}/job-status`,
    fetcher,
    {
      refreshInterval: (data) => {
        // only poll when a job is active, stops automatically when done
        const status = data?.job?.status;
        return status === "PENDING" || status === "PROCESSING" ? 10000 : 0;
      },
      revalidateOnFocus: true,   // user tabs back in after waiting → refetches
      revalidateOnReconnect: true, // user loses network and reconnects → refetches
    }
  );

  const activeImagenJob = jobData?.job ?? null;
  const hasActiveImagenJob =
    activeImagenJob?.status === "PENDING" ||
    activeImagenJob?.status === "PROCESSING";

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

    return () => {
      isMounted = false;
    };
  }, [subdomain.slug]);

  return (
    <BookingContext.Provider
      value={{
        booking,
        subdomain,
        isLoading,
        error,
        isShareDialogOpen,
        setIsShareDialogOpen,
        isExportDialogOpen,
        setIsExportDialogOpen,
        activeImagenJob,
        hasActiveImagenJob,
      }}
    >
      {children}
    </BookingContext.Provider>
  );
}

export function useBooking() {
  const context = useContext(BookingContext);
  if (!context)
    throw new Error("useBooking must be used within a BookingProvider");
  return context;
}