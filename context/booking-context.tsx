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
  activeImagenJob: Job | null;
  hasActiveImagenJob: boolean;
  activeUpscaleJob: Job | null;
  hasActiveUpscaleJob: boolean;
  refreshUpscaleJob: () => void;
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

  const { data: imagenJobData } = useSWR<{ job: Job | null }>(
    `/api/subdomain/${subdomain.slug}/booking/${initialBooking.huelineId}/imagen-job-status`,
    fetcher,
    {
      refreshInterval: (data) => {
        const status = data?.job?.status;
        return status === "PENDING" || status === "PROCESSING" ? 10000 : 0;
      },
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
    }
  );

  const activeImagenJob = imagenJobData?.job ?? null;
  const hasActiveImagenJob =
    activeImagenJob?.status === "PENDING" ||
    activeImagenJob?.status === "PROCESSING";

  const { data: upscaleJobData, mutate: mutateUpscaleJob } = useSWR<{ job: Job | null }>(
    `/api/subdomain/${subdomain.slug}/booking/${initialBooking.huelineId}/upscale-job-status`,
    fetcher,
    {
      refreshInterval: (data) => {
        const status = data?.job?.status;
        return status === "PENDING" || status === "PROCESSING" ? 10000 : 0;
      },
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
    }
  );

  const activeUpscaleJob = upscaleJobData?.job ?? null;
  const hasActiveUpscaleJob =
    activeUpscaleJob?.status === "PENDING" ||
    activeUpscaleJob?.status === "PROCESSING";

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
        activeUpscaleJob,
        hasActiveUpscaleJob,
        refreshUpscaleJob: mutateUpscaleJob,
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