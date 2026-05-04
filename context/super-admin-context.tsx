"use client";

import { createContext, useContext, ReactNode, useState } from "react";
import useSWR from "swr";
import { Log } from "@/types/subdomain-type";
import { AiSuggestionData } from "@/components/admin/prospects/ai-action-dock";

// ... [Keep your existing SuperAdminStats, Client, Admin interfaces] ...
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

// NEW: Type for our optimistic global queue
export interface PendingMessage {
  id: string;
  prospectId: string; // <-- Keeps track of who the message is for
  body: string;
  role: "OPERATOR";
  type: "SMS" | "EMAIL";
  createdAt: Date;
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

  logs: Log[] | undefined;
  isLogsLoading: boolean;

  // Communications
  sendSMS: (prospectId: string, body: string) => Promise<boolean>;
  sendEmail: (
    prospectId: string,
    body: string,
    subject?: string,
  ) => Promise<boolean>;
  fetchAiSuggestion: (clientId: string) => Promise<void>
  isSendingSMS: boolean;
  isSendingEmail: boolean;
  isAiLoading: boolean;
  AiSuggestion: AiSuggestionData | null;  // was: string | null
  clearAiSuggestion: () => void;           // was: missing entirely

  // Optimistic UI Queue
  pendingMessages: PendingMessage[];

  // Image Gen
  generateImage: (
    prospectId: string,
    mediaUrl: string,
    payload: { brand: string; color: any; deliveryMethod: "email" | "sms" },
  ) => Promise<boolean>;
  isGeneratingImage: boolean;

  // Success States
  smsSuccess: string | null;
  emailSuccess: string | null;
  generateImageSuccess: string | null;
}

const SuperAdminContext = createContext<SuperAdminContextType | undefined>(
  undefined,
);

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function SuperAdminProvider({ children }: { children: ReactNode }) {
  const {
    data: statsData,
    isLoading: isStatsLoading,
    mutate: mutateStats,
  } = useSWR<{ stats: SuperAdminStats }>("/api/admin/dashboard", fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
  });
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
    fetcher,
  );

  const logs = logsData?.logs;
  const admin = adminData?.admin;
  const stats = statsData?.stats;
  const clients = clientsData?.clients;

  // Global Sending States
  const [isSendingSMS, setIsSendingSMS] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false);

  // Global Success Messages
  const [smsSuccess, setSmsSuccess] = useState<string | null>(null);
  const [emailSuccess, setEmailSuccess] = useState<string | null>(null);
  const [generateImageSuccess, setGenerateImageSuccess] = useState<
    string | null
  >(null);

  // THE GLOBAL OPTIMISTIC QUEUE
  const [pendingMessages, setPendingMessages] = useState<PendingMessage[]>([]);

  // ??
  const [AiSuggestion, setAiSuggestion] = useState<AiSuggestionData | null>(null);

  // --- Communication Handlers ---
  const sendSMS = async (prospectId: string, body: string) => {
    // 1. Create the ghost message
    const tempId = `temp-${Date.now()}`;
    const ghostMsg: PendingMessage = {
      id: tempId,
      prospectId,
      body,
      role: "OPERATOR",
      type: "SMS",
      createdAt: new Date(),
    };

    // 2. Add to global queue
    setPendingMessages((prev) => [...prev, ghostMsg]);
    setIsSendingSMS(true);

    try {
      const res = await fetch(`/api/admin/prospects/${prospectId}/send-sms`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: body }),
      });
      if (!res.ok) throw new Error("Failed to send SMS");

      await new Promise((resolve) => setTimeout(resolve, 2000));

      setSmsSuccess("✓ SMS sent successfully");
      setTimeout(() => setSmsSuccess(null), 4000);
      return true;
    } catch (error) {
      console.error("SMS Error:", error);
      return false;
    } finally {
      // 3. Remove from global queue when done (whether success or fail)
      setPendingMessages((prev) => prev.filter((m) => m.id !== tempId));
      setIsSendingSMS(false);
    }
  };

  const sendEmail = async (
    prospectId: string,
    body: string,
    subject = "Update from Your Painter",
  ) => {
    const tempId = `temp-${Date.now()}`;
    const ghostMsg: PendingMessage = {
      id: tempId,
      prospectId,
      body,
      role: "OPERATOR",
      type: "EMAIL",
      createdAt: new Date(),
    };

    setPendingMessages((prev) => [...prev, ghostMsg]);
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
      setPendingMessages((prev) => prev.filter((m) => m.id !== tempId));
      setIsSendingEmail(false);
    }
  };

  const fetchAiSuggestion = async (clientId: string) => {
    setIsAiLoading(true);
    try {
      const res = await fetch(
        `/api/admin/prospects/${clientId}/ai-chat-suggestions`,
      );
      const data = await res.json();

      // Save this to state so your UI can render the shiny new box!
      setAiSuggestion(data);
    } catch (error) {
      console.error("Failed to fetch suggestion", error);
    } finally {
      setIsAiLoading(false);
    }
  };

  // In SuperAdminProvider, next to the other handlers
  const clearAiSuggestion = () => setAiSuggestion(null);

  const generateImage = async (
    prospectId: string,
    mediaUrl: string,
    payload: { brand: string; color: any; deliveryMethod: "email" | "sms" },
  ) => {
    setIsGeneratingImage(true);
    try {
      const res = await fetch(
        `/api/admin/prospects/${prospectId}/chat-imagen`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          // Send the mediaUrl alongside the brand, color, and delivery choice
          body: JSON.stringify({
            mediaUrl,
            brand: payload.brand,
            color: payload.color,
            deliveryMethod: payload.deliveryMethod,
          }),
        },
      );
      if (!res.ok) throw new Error("Failed to generate Image");

      setGenerateImageSuccess(
        `✓ Image Generating! Will send via ${payload.deliveryMethod}`,
      );
      setTimeout(() => setGenerateImageSuccess(null), 4000);
      return true;
    } catch (error) {
      console.error("Generating Image Error:", error);
      return false;
    } finally {
      setIsGeneratingImage(false);
    }
  };

  return (
    <SuperAdminContext.Provider
      value={{
        stats,
        isStatsLoading,
        refreshStats: mutateStats,
        clients,
        isClientsLoading,
        refreshClients: mutateClients,
        admin,
        isAdminLoading,
        logs,
        isLogsLoading,

        sendSMS,
        sendEmail,
        generateImage,
        fetchAiSuggestion,
        clearAiSuggestion,
        isAiLoading,
        isSendingSMS,
        isSendingEmail,
        isGeneratingImage,
        smsSuccess,
        emailSuccess,
        generateImageSuccess,
        AiSuggestion,

        pendingMessages, // Exposed!
      }}
    >
      {children}
    </SuperAdminContext.Provider>
  );
}

export function useSuperAdmin() {
  const context = useContext(SuperAdminContext);
  if (context === undefined)
    throw new Error("useSuperAdmin must be used within a SuperAdminProvider");
  return context;
}
