"use client";

import { createContext, useContext, ReactNode, useState } from "react";
import { Customer, SubdomainUser } from "@/app/generated/prisma";
import { AiSuggestionData } from "@/lib/moonshot";
import { OwnerData } from "@/types/owner";
import useSWR from "swr";

interface CustomerChat {
  id: string;
  name: string;
  phone?: string;
  [key: string]: any;
}
interface PendingMessage {
  id: string;
  customerId: string; // <-- Keeps track of who the message is for
  body: string;
  role: "OPERATOR";
  type: "SMS" | "EMAIL";
  createdAt: Date;
}

interface OwnerContextValue {
  subdomain: OwnerData;
  users: SubdomainUser[] | undefined;
  isUsersLoading: boolean;
  customers: Customer[] | undefined;
  isCustomersLoading: boolean;
  addCustomer: (
    customerName: string, 
    customerPhone: string,
    customerEmail: string
  ) => Promise<boolean>
  addCustomerDialogOpen: boolean;
  setAddCustomerDialogOpen: (open: boolean) => void;
  refreshCustomers: () => void;
  refreshUsers: () => void;
  isSendingSMS: boolean;
  isSendingEmail: boolean;
  isAiLoading: boolean;
  isGeneratingImage: boolean;
  isAddingCustomer: boolean;
  aiSuggestions: Record<string, AiSuggestionData>;
  pendingMessages: PendingMessage[];
  smsSuccess: string | null;
  emailSuccess: string | null;
  generateImageSuccess: string | null;
  activeChatProspect: CustomerChat | null;
  chatWindowState: "list" | "open" | "minimized" | "icon";
  sendSMS: (customerId: string, body: string) => Promise<boolean>;
  sendEmail: (
    customerId: string,
    body: string,
    subject?: string,
  ) => Promise<boolean>;
  fetchAiSuggestion: (customerId: string) => Promise<void>;
  clearAiSuggestion: (customerId: string) => void;
  generateImage: (
    prospectId: string,
    mediaUrl: string,
    payload: { brand: string; color: any; deliveryMethod: "email" | "sms" },
  ) => Promise<boolean>;
  openChat: (prospect: CustomerChat) => void;
  closeChat: () => void;
  toggleMinimize: () => void;
  openChatList: () => void;
  globalProspects: Customer[];
}

const OwnerContext = createContext<OwnerContextValue | null>(null);
const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function OwnerProvider({
  children,
  subdomain,
}: {
  children: ReactNode;
  subdomain: OwnerData;
}) {
  // --- SWR ---
  const {
    data: userData,
    isLoading: isUsersLoading,
    mutate: mutateUsers,
  } = useSWR<{ users: SubdomainUser[] }>(
    `/api/subdomain/${subdomain.slug}/users`,
    fetcher, // ✅ fix: was `fetcher.`
    { revalidateOnFocus: false },
  );

  const {
    data: customersData,
    isLoading: isCustomersLoading,
    mutate: mutateCustomers,
  } = useSWR<{ customers: Customer[] }>(
    `/api/subdomain/${subdomain.slug}/customers`,
    fetcher,
    { revalidateOnFocus: false },
  );

  // --- Action state ---
  const [isSendingSMS, setIsSendingSMS] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [pendingMessages, setPendingMessages] = useState<PendingMessage[]>([]);
  const [aiSuggestions, setAiSuggestions] = useState<
    Record<string, AiSuggestionData>
  >({});
  const [addCustomerDialogOpen, setAddCustomerDialogOpen] = useState(false);
  const [isAddingCustomer, setIsAddingCustomer] = useState(false);

  // --- Success banners ---
  const [smsSuccess, setSmsSuccess] = useState<string | null>(null);
  const [emailSuccess, setEmailSuccess] = useState<string | null>(null);
  const [generateImageSuccess, setGenerateImageSuccess] = useState<
    string | null
  >(null);

  // --- Chat widget ---
  const [activeChatProspect, setActiveChatProspect] =
    useState<CustomerChat | null>(null);
  const [chatWindowState, setChatWindowState] = useState<
    "icon" | "list" | "open" | "minimized"
  >("icon");

  const users = userData?.users;

  const openChat = (prospect: CustomerChat) => {
    setActiveChatProspect(prospect);
    setChatWindowState("open");
  };
  const closeChat = () => {
    setActiveChatProspect(null);
    setChatWindowState("icon");
  };
  const toggleMinimize = () =>
    setChatWindowState((prev) => (prev === "minimized" ? "open" : "minimized"));
  const openChatList = () => setChatWindowState("list");

  // --- Handlers (swap in real endpoints) ---
  const sendSMS = async (
    customerId: string,
    body: string,
  ): Promise<boolean> => {
    setIsSendingSMS(true);
    try {
      const res = await fetch(`/api/subdomain/${subdomain.slug}/sms`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customerId, body }),
      });
      if (res.ok) setSmsSuccess(customerId);
      return res.ok;
    } finally {
      setIsSendingSMS(false);
    }
  };

  const sendEmail = async (
    customerId: string,
    body: string,
    subject?: string,
  ): Promise<boolean> => {
    setIsSendingEmail(true);
    try {
      const res = await fetch(`/api/subdomain/${subdomain.slug}/email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customerId, body, subject }),
      });
      if (res.ok) setEmailSuccess(customerId);
      return res.ok;
    } finally {
      setIsSendingEmail(false);
    }
  };

  const fetchAiSuggestion = async (customerId: string): Promise<void> => {
    setIsAiLoading(true);
    try {
      const res = await fetch(
        `/api/subdomain/${subdomain.slug}/ai-suggestion?customerId=${customerId}`,
      );
      const data: AiSuggestionData = await res.json();
      setAiSuggestions((prev) => ({ ...prev, [customerId]: data }));
    } finally {
      setIsAiLoading(false);
    }
  };

  const clearAiSuggestion = (customerId: string) =>
    setAiSuggestions((prev) => {
      const next = { ...prev };
      delete next[customerId];
      return next;
    });

  const generateImage = async (
    prospectId: string,
    mediaUrl: string,
    payload: { brand: string; color: any; deliveryMethod: "email" | "sms" },
  ): Promise<boolean> => {
    setIsGeneratingImage(true);
    try {
      const res = await fetch(
        `/api/subdomain/${subdomain.slug}/jobs/create-image-job`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prospectId, mediaUrl, ...payload }),
        },
      );
      if (res.ok)
        setGenerateImageSuccess(
          `✓ Image Generating! Will send via ${payload.deliveryMethod}`,
        );
      setTimeout(() => setGenerateImageSuccess(null), 4000);
      return res.ok;
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const addCustomer = async (
    customerName: string,
    customerPhone: string,
    customerEmail: string,
  ) => {
    try {
      setIsAddingCustomer(true);

      const res = await fetch(`/api/subdomain/${subdomain.slug}/customers`, {
        method: "POST",
        body: JSON.stringify({
          customerName,
          customerEmail,
          customerPhone,
        }),
      });

      if(!res.ok) {
        throw new Error
      }
      return res.ok;
    } finally {
      setIsAddingCustomer(false);
    }
  };

  // ✅ fix: was `value` (undefined variable)
  return (
    <OwnerContext.Provider
      value={{
        subdomain,
        users: userData?.users,
        isUsersLoading,
        customers: customersData?.customers,
        isCustomersLoading,
        addCustomerDialogOpen,
        setAddCustomerDialogOpen,
        addCustomer,
        refreshCustomers: () => mutateCustomers(),
        refreshUsers: () => mutateUsers(),
        isSendingSMS,
        isSendingEmail,
        isAiLoading,
        isGeneratingImage,
        isAddingCustomer,
        aiSuggestions,
        pendingMessages,
        smsSuccess,
        emailSuccess,
        generateImageSuccess,
        activeChatProspect,
        chatWindowState,
        sendSMS,
        sendEmail,
        fetchAiSuggestion,
        clearAiSuggestion,
        generateImage,
        openChat,
        closeChat,
        toggleMinimize,
        openChatList,
        globalProspects: customersData?.customers ?? [],
      }}
    >
      {children}
    </OwnerContext.Provider>
  );
}

export function useOwner() {
  const context = useContext(OwnerContext);
  if (!context)
    throw new Error("useOwner must be used within an OwnerProvider");
  return context;
}
