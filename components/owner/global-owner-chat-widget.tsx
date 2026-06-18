"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import {
  RefreshCw,
  UserRound,
  X,
  Minus,
  MessageSquare,
  ChevronRight,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useOwner } from "@/context/owner-context";
import { OwnerAdvancedChatInput } from "@/components/owner/owner-advanced-chat-input";
import { OwnerChatBubble } from "@/components/owner/owner-chat-bubble";
import { HueClawStatusBubble } from "@/components/owner/hueclaw/hueclaw-status-chatbubble";

const morphTransition = {
  type: "spring" as const,
  stiffness: 350,
  damping: 30,
};

export function GlobalOwnerChatWidget() {
  const {
    subdomain,
    pendingMessages,
    activeThread: customer,
    chatWindowState,
    sendSMS,
    isSendingSMS,
    sendEmail,
    dialCustomer,
    isSendingEmail,
    openChat,
    closeChat,
    toggleMinimize,
    openChatList,
    me,
    chatThreads,
    isThreadsLoading,
  } = useOwner();

  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const bottomRef = useRef<HTMLDivElement>(null);
  const prevMessageCount = useRef(0);

  const customerPendingMessages = pendingMessages.filter(
    (m) => m.customerId === customer?.id,
  );

  const fetchMessages = async (isBackgroundPoll = false) => {
    // 2. NEW THREAD LOGIC: Make sure we have both customerId AND threadId
    if (!customer?.id || !customer?.threadId) return;

    if (!isBackgroundPoll) setLoading(true);
    try {
      const res = await fetch(
        `/api/subdomain/${subdomain.slug}/customers/${customer.id}/${customer.threadId}`,
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
    )
      return;

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

  useEffect(() => {
    if (
      chatWindowState === "open" &&
      combinedMessages.length > prevMessageCount.current
    ) {
      setTimeout(
        () => bottomRef.current?.scrollIntoView({ behavior: "smooth" }),
        100,
      );
    }
    prevMessageCount.current = combinedMessages.length;
  }, [combinedMessages.length, chatWindowState]);

 const handleSendMessage = async (
    message: string,
    channel: "SMS" | "EMAIL" | "DIAL",
    subject?: string,
    customerPhone?: string,
    operatorPhone?: string
  ) => {
    setTimeout(
      () => bottomRef.current?.scrollIntoView({ behavior: "smooth" }),
      50,
    );

    const success =
      channel === "SMS"
        ? await sendSMS(customer!.id, customer!.threadId, message)
        : channel === "EMAIL"
          ? await sendEmail(customer!.id, customer!.threadId, message, subject)
          : await dialCustomer(
              customer!.id, 
              customer!.threadId, 
              customerPhone || customer?.phone!, 
              "AI_CONFERENCE", // <-- Pass your desired callType string here
              operatorPhone || me?.phone!
            );

    if (success) fetchMessages();
  };


  const initials = customer?.name
    ?.split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end pointer-events-none">
      <AnimatePresence mode="wait">
        {chatWindowState === "icon" && (
          <motion.button
            layoutId="chat-widget-morph"
            key="icon"
            transition={morphTransition}
            onClick={openChatList}
            className="h-16 w-16 rounded-full bg-primary shadow-2xl flex items-center justify-center text-primary-foreground hover:scale-105 transition-transform pointer-events-auto"
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              <MessageSquare size={26} />
            </motion.div>
          </motion.button>
        )}

        {/* ─── STATE 2: THE RECENT CHATS LIST ──────────────────────── */}
        {chatWindowState === "list" && (
          <motion.div
            layoutId="chat-widget-morph"
            key="list"
            transition={morphTransition}
            className="w-[320px] h-[450px] bg-background shadow-2xl rounded-3xl overflow-hidden border border-border pointer-events-auto flex flex-col"
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="flex flex-col h-full"
            >
              <div className="flex items-center justify-between px-5 py-4 border-b bg-muted/40 shrink-0">
                <h3 className="font-bold text-sm">Recent Threads</h3>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={closeChat}
                  className="h-7 w-7 rounded-full text-muted-foreground hover:bg-black/10 dark:hover:bg-white/10"
                >
                  <X size={16} />
                </Button>
              </div>
              <ScrollArea className="flex-1 p-2">
                {/* 3. NEW THREAD LOGIC: Render threads from chatThreads instead of globalProspects */}
                {isThreadsLoading ? (
                  <p className="text-center text-muted-foreground text-xs mt-10">
                    Loading threads...
                  </p>
                ) : chatThreads.length === 0 ? (
                  <p className="text-center text-muted-foreground text-xs mt-10">
                    No active threads found.
                  </p>
                ) : (
                  chatThreads.slice(0, 10).map((thread) => (
                    <div
                      key={thread.id}
                      onClick={() =>
                        openChat({
                          id: thread.customerId,
                          threadId: thread.id,
                          name: thread.customer?.name ?? "Unknown",
                          phone: thread.customer?.phone ?? undefined,
                          email: thread.customer?.email ?? undefined,
                          isAutoPilot: thread.isAutoPilot,
                          shortId: thread.shortId,
                        })
                      }
                      className="flex items-center justify-between p-3 hover:bg-muted/50 rounded-xl cursor-pointer transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                          <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                            {thread.customer?.name
                              ?.slice(0, 2)
                              .toUpperCase() ?? <UserRound size={16} />}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                          <span className="text-sm font-semibold line-clamp-1">
                            {thread.customer?.name ?? "Unknown"}
                          </span>
                          <span className="text-[10px] text-muted-foreground">
                            Tap to view thread
                          </span>
                        </div>
                      </div>
                      <ChevronRight
                        size={16}
                        className="text-muted-foreground"
                      />
                    </div>
                  ))
                )}
              </ScrollArea>
            </motion.div>
          </motion.div>
        )}

        {/* --- STATE 3 & STATE 4 ARE UNCHANGED --- */}
        {chatWindowState === "minimized" && (
          <motion.div
            layoutId="chat-widget-morph"
            key="minimized-pill"
            transition={morphTransition}
            className="flex items-center bg-primary text-primary-foreground shadow-2xl rounded-full p-1.5 pr-2 pointer-events-auto border border-primary/20"
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="flex items-center"
            >
              <div
                className="flex items-center gap-3 cursor-pointer hover:bg-black/10 dark:hover:bg-white/10 px-2 py-1 rounded-full transition-colors"
                onClick={toggleMinimize}
              >
                <div className="relative">
                  <Avatar className="h-9 w-9 border-2 border-primary">
                    <AvatarFallback className="bg-zinc-200 text-zinc-800 font-bold text-xs">
                      {initials ?? <UserRound size={16} />}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 bg-green-500 rounded-full border-2 border-primary" />
                </div>
                <div className="flex flex-col items-start text-sm text-left pr-2">
                  <span className="font-semibold line-clamp-1 max-w-[120px]">
                    {customer?.name}
                  </span>
                  <span className="text-[10px] opacity-80 flex items-center gap-1">
                    <MessageSquare size={10} /> Active
                  </span>
                </div>
              </div>

              <button
                onClick={closeChat}
                className="h-8 w-8 flex items-center justify-center rounded-full hover:bg-black/20 dark:hover:bg-white/20 transition-colors shrink-0 ml-1"
              >
                <X size={16} />
              </button>
            </motion.div>
          </motion.div>
        )}

        {chatWindowState === "open" && (
          <motion.div
            layoutId="chat-widget-morph"
            key="open-window"
            transition={morphTransition}
            className="flex flex-col w-[95%] sm:w-[550px] h-[calc(100vh-48px)] bg-background/85 shadow-2xl rounded-3xl overflow-hidden border border-border pointer-events-auto"
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.15 }}
              className="flex flex-col h-full"
            >
              <div className="flex items-center justify-between px-4 py-3 border-b bg-muted/40 shrink-0">
                <div className="flex items-center gap-3">
                  <Avatar className="h-9 w-9">
                    <AvatarFallback className="bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-200 text-sm font-semibold">
                      {initials ?? <UserRound size={16} />}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <p className="text-sm font-semibold leading-tight">
                      {customer?.name}
                    </p>
                    <div className="flex gap-2 items-center">
                      <p className="text-xs text-muted-foreground">
                        {customer?.phone}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {customer?.email}
                      </p>
                    </div>
                    {customer?.threadId && (
                      <p className="text-[10px] px-1 py-0 h-4 font-mono text-muted-foreground">
                        Thread: {customer?.shortId}
                        {/* slices to show just the last 6 chars so it looks clean */}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <Badge
                    variant="outline"
                    className="text-[10px] px-2 py-0.5 font-normal text-muted-foreground mr-1"
                  >
                    {messages.length} msgs
                  </Badge>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => fetchMessages()}
                    className="h-7 w-7 rounded-full"
                  >
                    <RefreshCw
                      size={14}
                      className={loading ? "animate-spin" : ""}
                    />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={toggleMinimize}
                    className="h-7 w-7 rounded-full text-muted-foreground hover:text-foreground"
                  >
                    <Minus size={16} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={closeChat}
                    className="h-7 w-7 rounded-full text-muted-foreground hover:text-red-500 hover:bg-red-500/10"
                  >
                    <X size={16} />
                  </Button>
                </div>
              </div>

              <div className="flex-1 min-h-0 flex flex-col bg-slate-50/50 dark:bg-zinc-950/50">
                <ScrollArea className="h-full px-1.5">
                  <div className="py-5 space-y-1">
                    {loading ? (
                      <div className="flex flex-col items-center justify-center h-40 gap-2 text-muted-foreground">
                        <RefreshCw size={16} className="animate-spin" />
                        <p className="text-sm">Loading messages...</p>
                      </div>
                    ) : combinedMessages.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-40 gap-2 text-muted-foreground">
                        <p className="text-sm">No messages yet</p>
                      </div>
                    ) : (
                      combinedMessages.map((msg: any, index: number) => {
                        const prevMsg = combinedMessages[index - 1];
                        const nextMsg = combinedMessages[index + 1];
                        const isGroupStart =
                          !prevMsg ||
                          prevMsg.role !== msg.role ||
                          prevMsg.type !== msg.type;
                        const isGroupEnd =
                          !nextMsg ||
                          nextMsg.role !== msg.role ||
                          nextMsg.type !== msg.type;

                        return (
                          <OwnerChatBubble
                            key={msg.id || index}
                            msg={msg}
                            prospectName={customer?.name}
                            prospectId={customer?.id}
                            isPending={msg.isPending}
                            isGroupStart={isGroupStart}
                            isGroupEnd={isGroupEnd}
                            onCancelFollowUp={async (threadId) => {
                              // Example cancellation logic:
                              await fetch(
                                `/api/subdomain/${subdomain.slug}/chat-threads/${threadId}/cancel-followup`,
                                {
                                  method: "POST",
                                  body: JSON.stringify({ threadId }),
                                },
                              );

                              // If you are using SWR for messages, revalidate here:
                              // mutate(...)
                            }}
                          />
                        );
                      })
                    )}
                    {customer?.threadId && (
                      <HueClawStatusBubble
                        threadId={customer?.threadId}
                        isAutoPilot={customer?.isAutoPilot}
                      />
                    )}
                    <div ref={bottomRef} className="h-2" />
                  </div>
                </ScrollArea>
              </div>

              <div className="shrink-0 bg-background border-t">
                <OwnerAdvancedChatInput
                  isLoading={isSendingSMS || isSendingEmail}
                  onSend={handleSendMessage}
                  clientId={customer?.id}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
