"use client";

import { createContext, useContext, ReactNode } from "react";
import useSWR from "swr";

interface SuperAdminStats {
  totalActive: number;
  activeChange: string;
  monthlyRevenue: number;
  revenueChange: string;
  totalValueFound: number;
  totalCallsLast30Days: number;
  totalCallsAllTime: number;
  totalSubdomains: number;
}

interface Client {
  id: string;
  slug: string;
  companyName: string | null;
  planName: string;
  active: boolean;
  totalCalls: number;
  totalValueFound: number;
  projectUrl: string
}

interface SuperAdminContextType {
  stats: SuperAdminStats | undefined;
  isStatsLoading: boolean;
  refreshStats: () => void;
  
  clients: Client[] | undefined;
  isClientsLoading: boolean;
  refreshClients: () => void;
}

const SuperAdminContext = createContext<SuperAdminContextType | undefined>(undefined);

interface SuperAdminProviderProps {
  children: ReactNode;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function SuperAdminProvider({ children }: SuperAdminProviderProps) {
  // Fetch admin stats with SWR - NO auto-refresh
  const { data: statsData, isLoading: isStatsLoading, mutate: mutateStats } = useSWR<{ stats: SuperAdminStats }>(
    '/api/admin/dashboard',
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  );

  // Fetch clients with SWR - NO auto-refresh
  const { data: clientsData, isLoading: isClientsLoading, mutate: mutateClients } = useSWR<{ clients: Client[] }>(
    '/api/admin/clients',
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  );

  const stats = statsData?.stats;
  const clients = clientsData?.clients;

  const refreshStats = () => {
    mutateStats();
  };

  const refreshClients = () => {
    mutateClients();
  };

  return (
    <SuperAdminContext.Provider 
      value={{ 
        stats,
        isStatsLoading,
        refreshStats,
        clients,
        isClientsLoading,
        refreshClients,
      }}
    >
      {children}
    </SuperAdminContext.Provider>
  );
}

export function useSuperAdmin() {
  const context = useContext(SuperAdminContext);
  if (context === undefined) {
    throw new Error("useSuperAdmin must be used within a SuperAdminProvider");
  }
  return context;
}