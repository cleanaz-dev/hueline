"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
  useRef,
} from "react";
import { BookingData, SubdomainAccountData } from "@/types/subdomain-type";
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

  // Redis Lock States
  hasActiveImagenJob: boolean;
  hasActiveUpscaleJob: boolean;

  // Mutators to trigger a check immediately when a user starts a job
  refreshImagenJob: () => void;
  refreshUpscaleJob: () => void;
  refreshBookingData: () => void;
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
  const {
    data: booking,
    mutate: refreshBookingData,
    isLoading,
    error,
  } = useSWR(
    `/api/subdomain/${subdomain.slug}/booking/${initialBooking.huelineId}/get-presigned-urls`,
    async (url) => {
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to load images");
      const { originalImages, mockups } = await res.json();

      return {
        ...initialBooking,
        originalImages,
        mockups: mockups.map((mockup: any, index: number) => ({
          ...(initialBooking.mockups ? initialBooking.mockups[index] : {}),
          ...mockup,
        })),
      };
    },
    {
      fallbackData: initialBooking, // Sets initial state so UI renders instantly!
      revalidateOnFocus: false, // Optional: tweak based on your needs
    },
  );

  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);

  // 1. IMAGEN REDIS LOCK POLLING
  const { data: imagenLock, mutate: refreshImagenJob } = useSWR<{
    isGenerating: boolean;
  }>(
    `/api/subdomain/${subdomain.slug}/check-lock/${initialBooking.huelineId}?context=IMAGEN`,
    fetcher,
    {
      // If true, poll every 10s. If false, stop polling (0).
      refreshInterval: (data) => (data?.isGenerating ? 7500 : 0),
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
    },
  );

  const hasActiveImagenJob = imagenLock?.isGenerating ?? false;

  // 2. UPSCALE REDIS LOCK POLLING
  const { data: upscaleLock, mutate: refreshUpscaleJob } = useSWR<{
    isGenerating: boolean;
  }>(
    `/api/subdomain/${subdomain.slug}/check-lock/${initialBooking.huelineId}?context=UPSCALE`,
    fetcher,
    {
      // If true, poll every 10s. If false, stop polling (0).
      refreshInterval: (data) => (data?.isGenerating ? 7500 : 0),
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
    },
  );

  const hasActiveUpscaleJob = upscaleLock?.isGenerating ?? false;

  const prevImagenState = useRef(hasActiveImagenJob);
  const prevUpscaleState = useRef(hasActiveUpscaleJob);

  useEffect(() => {
    // If it WAS generating previously, but NOW it is false -> The job just finished!
    if (prevImagenState.current === true && hasActiveImagenJob === false) {
      console.log("Imagen job finished! Refreshing booking data...");
      refreshBookingData();
    }
    // Update the ref for the next render
    prevImagenState.current = hasActiveImagenJob;
  }, [hasActiveImagenJob, refreshBookingData]);

  useEffect(() => {
    if (prevUpscaleState.current === true && hasActiveUpscaleJob === false) {
      console.log("Upscale job finished! Refreshing booking data...");
      refreshBookingData();
    }
    prevUpscaleState.current = hasActiveUpscaleJob;
  }, [hasActiveUpscaleJob, refreshBookingData]);

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
        hasActiveImagenJob,
        hasActiveUpscaleJob,
        refreshImagenJob,
        refreshUpscaleJob,
        refreshBookingData,
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
