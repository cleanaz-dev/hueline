"use client";

import { createContext, useContext, ReactNode, useState } from "react";
import useSWR from "swr";
import { Log } from "@/types/subdomain-type";

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
  projectUrl: string;
}
interface Admin {
  name: string;
  email: string;
  imageUrl: string | undefined;
}

interface SuperAdminContextType {
  stats: SuperAdminStats | undefined;
  isStatsLoading: boolean;
  refreshStats: () => void;

  clients: Client[] | undefined;
  isClientsLoading: boolean;
  refreshClients: () => void;

  admin: Admin | undefined;
  isAdminLoading: boolean;

  logs: Log[] |undefined
  isLogsLoading: boolean

  // NEW: Prospect Communications
  sendSMS: (prospectId: string, body: string) => Promise<boolean>;
  sendEmail: (prospectId: string, body: string, subject?: string) => Promise<boolean>;
  isSendingSMS: boolean;
  isSendingEmail: boolean;
  isGeneratingImage: boolean;
  smsSuccess: string | null;
  emailSuccess: string | null;
  generateImage: (mediaUrl: string, body: string) => Promise<boolean>;
  generateImageSuccess: string | null;
  

}

const SuperAdminContext = createContext<SuperAdminContextType | undefined>(
  undefined
);

interface SuperAdminProviderProps {
  children: ReactNode;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function SuperAdminProvider({ children }: SuperAdminProviderProps) {
  // Fetch admin stats with SWR - NO auto-refresh
  const {
    data: statsData,
    isLoading: isStatsLoading,
    mutate: mutateStats,
  } = useSWR<{ stats: SuperAdminStats }>("/api/admin/dashboard", fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
  });

  // Fetch clients with SWR - NO auto-refresh
  const {
    data: clientsData,
    isLoading: isClientsLoading,
    mutate: mutateClients,
  } = useSWR<{ clients: Client[] }>("/api/admin/clients", fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
  });

  const { data: adminData, isLoading: isAdminLoading } = useSWR<{
    admin: Admin;
  }>("/api/admin", fetcher);

  const { data: logsData, isLoading: isLogsLoading } = useSWR<{ logs: Log[] }>(
    "/api/admin/logs",
    fetcher
  );
  const logs = logsData?.logs
  const admin = adminData?.admin;
  const stats = statsData?.stats;
  const clients = clientsData?.clients;

  const refreshStats = () => {
    mutateStats();
  };

  const refreshClients = () => {
    mutateClients();
  };

  // --- NEW: Global Sending States ---
  const[isSendingSMS, setIsSendingSMS] = useState(false);
  const[isSendingEmail, setIsSendingEmail] = useState(false);
  const [smsSuccess, setSmsSuccess] = useState<string | null>(null);
  const [emailSuccess, setEmailSuccess] = useState<string | null>(null);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false)
  const [generateImageSuccess, setGenerateImageSuccess] = useState<string | null>(null)

   // --- NEW: Communication Handlers ---
  const sendSMS = async (prospectId: string, body: string) => {
    setIsSendingSMS(true);
    try {
      const res = await fetch(`/api/admin/prospects/${prospectId}/send-sms`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: body }),
      });
      if (!res.ok) throw new Error("Failed to send SMS");
      setSmsSuccess("✓ SMS sent successfully");
      setTimeout(() => setSmsSuccess(null), 4000);
      
      // Optional: Refresh global logs or stats if sending a message impacts them
      // mutateLogs(); 
      
      return true;
    } catch (error) {
      console.error("SMS Error:", error);
      return false;
    } finally {
      setIsSendingSMS(false);
    }
  };

  const sendEmail = async (prospectId: string, body: string, subject = "Update from Your Painter") => {
    setIsSendingEmail(true);
    try {
      const res = await fetch(`/api/admin/prospects/${prospectId}/send-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body, subject }),
      });
      if (!res.ok) throw new Error("Failed to send Email");
      setEmailSuccess("✓ Email sent successfully");
      setTimeout(() => setEmailSuccess(null), 4000);
      return true;
    } catch (error) {
      console.error("Email Error:", error);
      return false;
    } finally {
      setIsSendingEmail(false);
    }
  };

  const generateImage = async (mediaUrl: string, body: string) => {
    setIsGeneratingImage(true);
    try {
      const res = await fetch("LAMBDA_URL", {
        method: "POST",
        headers: { "Content-Type": "application/json"},
        body: JSON.stringify({ mediaUrl, body})
      })
      if (!res.ok) throw new Error("Failed to send Email");
      setGenerateImageSuccess("✓ Email sent successfully");
      return true
    } catch (error) {
      console.error("Generating Image Error:", error);
      return false;      
    } finally {
      setIsGeneratingImage(false)
    }
  }


  return (
    <SuperAdminContext.Provider
      value={{
        stats,
        isStatsLoading,
        refreshStats,
        clients,
        isClientsLoading,
        refreshClients,
        admin,
        isAdminLoading,
        logs,
        isLogsLoading,

        // New Communications
        sendSMS,
        sendEmail,
        generateImage,
        isSendingSMS,
        isSendingEmail,
        isGeneratingImage,

        smsSuccess,
        emailSuccess,
        generateImageSuccess
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
