// components/owner/chat-widget/use-thread-messages.ts
import { useState, useEffect, useMemo } from "react";
import { useOwner } from "@/context/owner-context";

export function useThreadMessages() {
  const { subdomain, activeThread: customer, chatWindowState, pendingMessages } = useOwner();
  
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const customerPendingMessages = pendingMessages.filter(
    (m) => m.customerId === customer?.id
  );

  const fetchMessages = async (isBackgroundPoll = false) => {
    if (!customer?.id || !customer?.threadId) return;

    if (!isBackgroundPoll) setLoading(true);
    try {
      const res = await fetch(
        `/api/subdomain/${subdomain.slug}/customers/${customer.id}/${customer.threadId}`
      );
      const data = await res.json();
      setMessages(data);
    } catch (err) {
      console.error("Fetch error", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (
      (chatWindowState !== "open" && chatWindowState !== "minimized") ||
      !customer?.id ||
      !customer?.threadId
    ) return;

    setMessages((prev) => (prev[0]?.customerId !== customer.id ? [] : prev));
    fetchMessages();

    const pollInterval = setInterval(() => fetchMessages(true), 10000);
    return () => clearInterval(pollInterval);
  }, [chatWindowState, customer?.id, customer?.threadId]);

  const combinedMessages = useMemo(() => {
    return [
      ...messages,
      ...customerPendingMessages.map((m) => ({ ...m, isPending: true })),
    ];
  }, [messages, customerPendingMessages]);

  return {
    messages,
    loading,
    combinedMessages,
    fetchMessages,
  };
}