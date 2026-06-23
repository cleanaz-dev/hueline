"use client";

import {
  createContext,
  useContext,
  ReactNode,
  useState,
  useEffect,
  useRef,
} from "react";
import { Customer, SubdomainUser } from "@/app/generated/prisma";
import { AiSuggestionData } from "@/lib/moonshot";
import { OwnerData } from "@/types/owner";
import useSWR, { mutate } from "swr";
import axios from "axios";
import { pusherClient } from "@/lib/pusher/pusher-client";

// 1. NEW THREAD LOGIC: Define your Thread model interface
export interface ChatThreadModel {
  id: string;
  shortId: string;
  isAutoPilot: boolean;
  customerId: string;
  customer?: {
    id: string;
    name: string;
    phone?: string;
    email?: string;
  };
  createdAt?: string | Date;
}

interface CustomerChat {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  isAutoPilot: boolean;
  threadId: string;
  shortId: string;
  [key: string]: any;
}

interface PendingMessage {
  id: string;
  customerId: string;
  body: string;
  role: "OPERATOR";
  type: "SMS" | "EMAIL";
  createdAt: Date;
}

interface OwnerContextValue {
  subdomain: OwnerData;
  me: SubdomainUser | undefined;
  users: SubdomainUser[] | undefined;
  isMeLoading: boolean;
  isUsersLoading: boolean;
  customers: Customer[] | undefined;
  isCustomersLoading: boolean;

  // 2. NEW THREAD LOGIC: Expose threads
  chatThreads: ChatThreadModel[];
  isThreadsLoading: boolean;
  refreshThreads: () => void;
  dialCustomer: (
    customerId: string,
    threadId: string,
    customerNumber: string,
    callType: string,
    operatorNumber?: string,
  ) => Promise<boolean>;
  addCustomer: (
    customerName: string,
    customerPhone: string,
    customerEmail: string,
  ) => Promise<boolean>;
  inviteMember: (
    memberName: string,
    memberPhone: string,
    memberEmail: string,
  ) => Promise<boolean>;
  addCustomerDialogOpen: boolean;
  setAddCustomerDialogOpen: (open: boolean) => void;
  inviteMemberDialogOpen: boolean;
  setInviteMemberDialogOpen: (open: boolean) => void;
  isInvitingMember: boolean;
  isReportingTask: boolean;
  reportTaskDialogOpen: boolean;
  setReportTaskDialogOpen: (open: boolean) => void;
  reportTask: (taskId: string, text: string) => Promise<boolean>;
  refreshCustomers: () => void;
  refreshUsers: () => void;
  isSendingSMS: boolean;
  isSendingEmail: boolean;
  isDialing: boolean;
  isAiLoading: boolean;
  isGeneratingImage: boolean;
  isCancellingCall: boolean;
  handleHangUpCall: (customerId: string, threadId: string) => Promise<boolean>;
  isAddingCustomer: boolean;
  aiSuggestions: Record<string, AiSuggestionData>;
  pendingMessages: PendingMessage[];
  smsSuccess: string | null;
  emailSuccess: string | null;
  generateImageSuccess: string | null;
  activeThread: CustomerChat | null;
  chatWindowState: "list" | "open" | "minimized" | "icon";
  sendSMS: (
    customerId: string,
    threadId: string,
    body: string,
  ) => Promise<boolean>;
  sendEmail: (
    customerId: string,
    threadId: string,
    body: string,
    subject?: string,
  ) => Promise<boolean>;

  fetchAiSuggestion: (customerId: string, threadId: string) => Promise<void>;
  clearAiSuggestion: (customerId: string, threadId: string) => void;
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
  hueClawAi: (
    customerId: string,
    threadId: string,
    trigger: string,
  ) => Promise<void>;

  //New Thread
  newThreadAlert: ChatThreadModel | null;
  dismissNewThreadAlert: () => void;
  openNewThreadAlert: () => void;

  // Cancel Follow Up
  handleCancelFollowUp: (threadId: string, customerId: string, followUpId: string) => Promise<boolean>
  isCancellingFollowUp: boolean
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
  const {
    data: userData,
    isLoading: isUsersLoading,
    mutate: mutateUsers,
  } = useSWR<{ users: SubdomainUser[] }>(
    `/api/subdomain/${subdomain.slug}/users`,
    fetcher,
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

  const {
    data: meData,
    isLoading: isMeLoading,
    mutate: mutateMe,
  } = useSWR<{ me: SubdomainUser }>(
    `/api/subdomain/${subdomain.slug}/me`,
    fetcher,
    { revalidateOnFocus: false },
  );

  // 3. NEW THREAD LOGIC: SWR to fetch your recent chat threads.

  const {
    data: threadsData,
    isLoading: isThreadsLoading,
    mutate: mutateThreads,
  } = useSWR<{ threads: ChatThreadModel[] }>(
    `/api/subdomain/${subdomain.slug}/chat-threads`,
    fetcher,
    { revalidateOnFocus: false },
  );

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
  const [isInvitingMember, setIsInvitingMember] = useState(false);
  const [inviteMemberDialogOpen, setInviteMemberDialogOpen] = useState(false);
  const [reportTaskDialogOpen, setReportTaskDialogOpen] = useState(false);
  const [isReportingTask, setIsReportingTask] = useState(false);
  const [isDialing, setIsDialing] = useState(false);
  const [isCancellingCall, setIsCancellingCall] = useState(false);
  const [isCancellingFollowUp, setIsCancellingFollowUp] = useState(false);

  const [smsSuccess, setSmsSuccess] = useState<string | null>(null);
  const [emailSuccess, setEmailSuccess] = useState<string | null>(null);
  const [generateImageSuccess, setGenerateImageSuccess] = useState<
    string | null
  >(null);

  const [activeThread, setActiveThread] = useState<CustomerChat | null>(null);
  const [chatWindowState, setChatWindowState] = useState<
    "icon" | "list" | "open" | "minimized"
  >("icon");

  const users = userData?.users;
  const me = meData?.me;
  // --- NEW THREAD DETECTION LOGIC ---
  const [newThreadAlert, setNewThreadAlert] = useState<ChatThreadModel | null>(
    null,
  );
  useEffect(() => {
    if (!subdomain?.slug) return;

    // Tune into the main dashboard frequency for this specific subdomain
    const channelName = `dashboard-${subdomain.slug}`;
    const channel = pusherClient.subscribe(channelName);

    // Listen for the "new-thread" event
    channel.bind("new-thread", (newThread: ChatThreadModel) => {
      // A) Trigger the animated framer-motion widget INSTANTLY
      setNewThreadAlert(newThread);

      // B) Silently inject this new thread into SWR's cache so that
      // when they open their thread list, it's already there!
      mutateThreads((currentData) => {
        if (!currentData) return { threads: [newThread] };

        // Prevent duplicate injections just in case
        if (currentData.threads.some((t) => t.id === newThread.id)) {
          return currentData;
        }

        // Put the new thread at the top of the list
        return { threads: [newThread, ...currentData.threads] };
      }, false); // false = do not re-fetch from API, we already have the data!
    });

    return () => {
      pusherClient.unsubscribe(channelName);
    };
  }, [subdomain?.slug, mutateThreads]);

  const dismissNewThreadAlert = () => setNewThreadAlert(null);

  const openNewThreadAlert = () => {
    if (!newThreadAlert) return;

    // Map the ChatThreadModel back to your CustomerChat format to open it
    const prospectChat: CustomerChat = {
      id: newThreadAlert.customer?.id || newThreadAlert.customerId,
      name: newThreadAlert.customer?.name || "Unknown",
      phone: newThreadAlert.customer?.phone,
      email: newThreadAlert.customer?.email,
      isAutoPilot: newThreadAlert.isAutoPilot,
      threadId: newThreadAlert.id,
      shortId: newThreadAlert.shortId,
    };

    openChat(prospectChat);
    dismissNewThreadAlert(); // Hide the alert widget
  };

  const openChat = (prospect: CustomerChat) => {
    setActiveThread(prospect);
    setChatWindowState("open");
  };
  const closeChat = () => {
    setActiveThread(null);
    setChatWindowState("icon");
  };
  const toggleMinimize = () =>
    setChatWindowState((prev) => (prev === "minimized" ? "open" : "minimized"));
  const openChatList = () => setChatWindowState("list");

  // Keep all your original API handler logic...
  const sendSMS = async (
    customerId: string,
    threadId: string,
    body: string,
  ): Promise<boolean> => {
    setIsSendingSMS(true);
    try {
      const res = await fetch(
        `/api/subdomain/${subdomain.slug}/customers/${customerId}/sms`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ customerId, threadId, body }),
        },
      );
      if (res.ok) setSmsSuccess(customerId);
      return res.ok;
    } finally {
      setIsSendingSMS(false);
    }
  };

  const sendEmail = async (
    customerId: string,
    threadId: string,
    body: string,
    subject?: string,
  ): Promise<boolean> => {
    setIsSendingEmail(true);
    try {
      const res = await fetch(
        `/api/subdomain/${subdomain.slug}/customers/${customerId}/email`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ customerId, threadId, body, subject }),
        },
      );
      if (res.ok) setEmailSuccess(customerId);
      return res.ok;
    } finally {
      setIsSendingEmail(false);
    }
  };

  const fetchAiSuggestion = async (
    customerId: string,
    threadId: string,
  ): Promise<void> => {
    setIsAiLoading(true);
    try {
      const res = await fetch(
        `/api/subdomain/${subdomain.slug}/customers/${customerId}/${threadId}/ai-chat-suggestions`,
      );
      const data: AiSuggestionData = await res.json();
      setAiSuggestions((prev) => ({ ...prev, [customerId]: data }));
    } finally {
      setIsAiLoading(false);
    }
  };

  const dialCustomer = async (
    customerId: string,
    threadId: string,
    customerNumber: string,
    callType: string,
    operatorNumber?: string,
  ): Promise<boolean> => {
    setIsDialing(true);
    try {
      const res = await fetch(
        `/api/subdomain/${subdomain.slug}/customers/${customerId}/${threadId}/dial`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            customerNumber,
            operatorNumber,
            callType,
          }),
        },
      );

      if (!res.ok) {
        // release resourcelock
        return false; // <-- Return false if it failed
      }

      return true; // <-- Return true so your chat widget updates!
    } catch (error) {
      console.error("Dialing error:", error);
      return false; // <-- Return false on network error
    } finally {
      // release resourceLock
      setIsDialing(false);
    }
  };

  const hueClawAi = async (
    customerId: string,
    threadId: string,
    trigger: string,
  ): Promise<void> => {
    try {
      const { data } = await axios.post<AiSuggestionData>(
        `/api/subdomain/${subdomain.slug}/hue-claw/${threadId}/${trigger}`,
      );
      setAiSuggestions((prev) => ({ ...prev, [customerId]: data }));

      // 🚨 ADD THIS LINE:
      // This tells SWR to instantly check the status, which will see
      // isWorking: true, making the bubble appear and start 2s polling!
      mutate(
        `/api/subdomain/${subdomain.slug}/threads/${threadId}/hueclaw-status`,
      );
    } finally {
      console.log("Hue Claw in Action!");
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
        `/api/subdomain/${subdomain.slug}/system-tasks/create-image-task`,
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
        body: JSON.stringify({ customerName, customerEmail, customerPhone }),
      });
      if (!res.ok) throw new Error();
      return res.ok;
    } finally {
      setIsAddingCustomer(false);
    }
  };

  const inviteMember = async (
    memberName: string,
    memberPhone: string,
    memberEmail: string,
  ) => {
    try {
      setIsInvitingMember(true);
      const res = await fetch(`/api/subdomain/${subdomain.slug}/customers`, {
        method: "POST",
        body: JSON.stringify({ memberName, memberPhone, memberEmail }),
      });
      if (!res.ok) throw new Error();
      return res.ok;
    } finally {
      setIsInvitingMember(false);
    }
  };

  const reportTask = async (taskId: string, text: string) => {
    try {
      setIsReportingTask(true);
      const res = await fetch(
        `/api/subdomain/${subdomain.slug}/system-tasks/report-issue/${taskId}`,
        {
          method: "POST",
          body: JSON.stringify({ text }),
        },
      );
      if (!res.ok) throw new Error();
      return res.ok;
    } finally {
      setIsReportingTask(false);
    }
  };

  const handleHangUpCall = async (
    customerId: string,
    threadId: string,
  ): Promise<boolean> => {
    setIsCancellingCall(true);
    try {
      const res = await fetch(
        `/api/subdomain/${subdomain.slug}/customers/${customerId}/${threadId}/hang-up`,
        {
          method: "POST",
        },
      );
      if (!res.ok) throw new Error();
      return res.ok;
    } finally {
      setIsCancellingCall(false);
    }
  };

  const handleCancelFollowUp = async (
    followUpId: string,
    threadId: string,
    customerId: string,
  ): Promise<boolean> => {
    setIsCancellingFollowUp(true);
    try {
      const res = await fetch(
        `/api/subdomain/${subdomain.slug}/customers/${customerId}/${threadId}/cancel-followup`,
        {
          method: "POST",
          body: JSON.stringify({ followUpId }),
        },
      );
      if (!res.ok) throw new Error();
      return res.ok;
    } finally {
      setIsCancellingFollowUp(false);
    }
  };

  return (
    <OwnerContext.Provider
      value={{
        subdomain,
        me,
        users,
        isMeLoading,
        isUsersLoading,
        customers: customersData?.customers,
        isCustomersLoading,
        dialCustomer,
        // 4. NEW THREAD LOGIC: Provide Threads
        chatThreads: threadsData?.threads ?? [],
        isThreadsLoading,
        refreshThreads: () => mutateThreads(),
        isCancellingCall,
        handleHangUpCall,
        isInvitingMember,
        addCustomerDialogOpen,
        setAddCustomerDialogOpen,
        addCustomer,
        inviteMember,
        inviteMemberDialogOpen,
        setInviteMemberDialogOpen,
        refreshCustomers: () => mutateCustomers(),
        refreshUsers: () => mutateUsers(),
        reportTask,
        reportTaskDialogOpen,
        setReportTaskDialogOpen,
        isReportingTask,
        isSendingSMS,
        isSendingEmail,
        isDialing,
        isAiLoading,
        isGeneratingImage,
        isAddingCustomer,
        aiSuggestions,
        pendingMessages,
        smsSuccess,
        emailSuccess,
        generateImageSuccess,
        activeThread,
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
        hueClawAi,

        newThreadAlert,
        dismissNewThreadAlert,
        openNewThreadAlert,
        // Cancel Follow Up
        handleCancelFollowUp,
        isCancellingFollowUp
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
