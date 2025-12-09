"use client";

import { createContext, useContext, ReactNode, useMemo } from "react";
import useSWR, { KeyedMutator } from "swr";
import { SubdomainAccountData } from "@/types/subdomain-type";

// Define the Context Shape
interface SettingsContextType {
  settings: SubdomainAccountData | undefined;
  isLoading: boolean;
  isError: boolean;
  mutate: KeyedMutator<SubdomainAccountData>;
  
  // Helpers
  isPlanActive: boolean;
  daysUntilRenewal: number | null;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

interface SettingsProviderProps {
  children: ReactNode;
  slug: string;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function SettingsProvider({ children, slug }: SettingsProviderProps) {
  
  const { data, error, isLoading, mutate } = useSWR<SubdomainAccountData>(
    slug ? `/api/subdomain/${slug}/my-account` : null,
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000,
      shouldRetryOnError: false,
    }
  );

  // Helper Logic
  // We check 'active' or 'trialing' directly on the flat data object
  const isPlanActive = data?.planStatus === 'active' || data?.planStatus === 'trialing';
  
  const daysUntilRenewal = useMemo(() => {
    if (!data?.currentPeriodEnd) return null;
    
    const today = new Date();
    const renewal = new Date(data.currentPeriodEnd);
    
    // Handle invalid dates if API sends bad data
    if (isNaN(renewal.getTime())) return null;

    const diffTime = renewal.getTime() - today.getTime();
    // Return 0 if date has passed
    if (diffTime < 0) return 0; 
    
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
  }, [data?.currentPeriodEnd]);

  const value = {
    settings: data,
    isLoading,
    isError: !!error,
    mutate,
    isPlanActive,
    daysUntilRenewal
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
}