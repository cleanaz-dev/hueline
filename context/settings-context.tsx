"use client";

import { createContext, useContext, ReactNode, useMemo, useState } from "react";
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
  
  // Invite functionality
  inviteUser: (email: string, role: "admin" | "member") => Promise<boolean>;
  isInviting: boolean;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

interface SettingsProviderProps {
  children: ReactNode;
  slug: string;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function SettingsProvider({ children, slug }: SettingsProviderProps) {
  const [isInviting, setIsInviting] = useState(false);
  
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
  const isPlanActive = data?.planStatus === 'active' || data?.planStatus === 'trialing';
  
  const daysUntilRenewal = useMemo(() => {
    if (!data?.currentPeriodEnd) return null;
    
    const today = new Date();
    const renewal = new Date(data.currentPeriodEnd);
    
    if (isNaN(renewal.getTime())) return null;

    const diffTime = renewal.getTime() - today.getTime();
    if (diffTime < 0) return 0; 
    
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
  }, [data?.currentPeriodEnd]);

  // Invite User Function
  const inviteUser = async (email: string, role: "admin" | "member"): Promise<boolean> => {
    setIsInviting(true);
    
    try {
      const response = await fetch(`/api/subdomain/${slug}/invite-member`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, role }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Failed to invite user:", errorData);
        // You could add toast notification here
        return false;
      }

      // Revalidate the settings data to get updated user list
      await mutate();
      return true;
    } catch (error) {
      console.error("Error inviting user:", error);
      return false;
    } finally {
      setIsInviting(false);
    }
  };

  const value = {
    settings: data,
    isLoading,
    isError: !!error,
    mutate,
    isPlanActive,
    daysUntilRenewal,
    inviteUser,
    isInviting,
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