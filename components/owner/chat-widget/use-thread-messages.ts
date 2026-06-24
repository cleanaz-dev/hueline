// components/owner/chat-widget/use-thread-messages.ts
import { useMemo, useEffect } from "react"; // 👈 Add useEffect
import useSWR from "swr";
import { useOwner } from "@/context/owner-context";
import { pusherClient } from "@/lib/pusher/pusher-client"; // 👈 Import pusherClient

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function useThreadMessages() {
  const { subdomain, activeThread: customer, chatWindowState, pendingMessages } = useOwner();

  const shouldFetch =
    (chatWindowState === "open" || chatWindowState === "minimized") &&
    customer?.id &&
    customer?.threadId;

  const url = shouldFetch
    ? `/api/subdomain/${subdomain.slug}/customers/${customer.id}/${customer.threadId}`
    : null;

  const { data, isLoading, mutate } = useSWR(url, fetcher, {
    refreshInterval: 10000,
    revalidateOnFocus: true,
  });

  // 🚨 ADD THIS EFFECT: Real-time Pusher listener
  useEffect(() => {
    if (!customer?.threadId) return;

    // Listen to the specific channel for this chat thread
    const channelName = `thread-${customer.threadId}`;
    const channel = pusherClient.subscribe(channelName);

    // When the webhook says there is a new message, INSTANTLY fetch!
    channel.bind("new-message", () => {
      mutate();
    });

    return () => {
      pusherClient.unsubscribe(channelName);
    };
  }, [customer?.threadId, mutate]); // Re-bind if the thread changes

  const messages = data || [];

  const customerPendingMessages = pendingMessages.filter(
    (m) => m.customerId === customer?.id
  );

  const combinedMessages = useMemo(() => {
    return [
      ...messages,
      ...customerPendingMessages.map((m) => ({ ...m, isPending: true })),
    ];
  }, [messages, customerPendingMessages]);

  return {
    messages,
    loading: isLoading,
    combinedMessages,
    fetchMessages: () => mutate(),
  };
}