// components/owner/chat-widget/widget-open.tsx

"use client";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, UserRound, X, Minus, ChevronsUpDown } from "lucide-react";

import { useOwner } from "@/context/owner-context";
import { useThreadMessages } from "./use-thread-messages";
import { morphTransition } from "./shared";

import { OwnerAdvancedChatInput } from "@/components/owner/owner-advanced-chat-input";
import { OwnerChatBubble } from "@/components/owner/owner-chat-bubble";
import { HueClawStatusBubble } from "@/components/owner/hueclaw/hueclaw-status-chatbubble";

export function WidgetOpen() {
  const {
    subdomain,
    activeThread: customer,
    chatWindowState,
    sendSMS,
    isSendingSMS,
    sendEmail,
    dialCustomer,
    isSendingEmail,
    closeChat,
    toggleMinimize,
    chatThreads,
    openChat,
    me,
  } = useOwner();

  const { messages, loading, combinedMessages, fetchMessages } =
    useThreadMessages();
  const [showSwitcher, setShowSwitcher] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatWindowState === "open" && bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [combinedMessages.length, chatWindowState]);

  const handleSendMessage = async (
    message: string,
    channel: "SMS" | "EMAIL" | "DIAL",
    subject?: string,
    customerPhone?: string,
    operatorPhone?: string,
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
              "AI_CONFERENCE",
              operatorPhone || me?.phone!,
            );

    if (success) fetchMessages();
  };

  const initials = customer?.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <motion.div
      layoutId="chat-widget-morph"
      transition={morphTransition}
      className="flex flex-col w-[95%] sm:w-[550px] h-[calc(100vh-48px)] bg-background/85 shadow-2xl rounded-3xl overflow-hidden border border-border pointer-events-auto relative"
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.15 }}
        className="flex flex-col h-full"
      >
        {/* HEADER */}
        <div className="flex items-center justify-between px-4 py-3 border-b bg-muted/40 shrink-0 relative">
          <div className="flex items-center gap-3">
            <Avatar className="h-9 w-9">
              <AvatarFallback className="bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-200 text-sm font-semibold">
                {initials ?? <UserRound size={16} />}
              </AvatarFallback>
            </Avatar>
            <div
              className="flex flex-col cursor-pointer hover:bg-muted/60 px-1.5 py-1 -ml-1.5 rounded-md transition-colors"
              onClick={() => setShowSwitcher(!showSwitcher)}
            >
              <div className="flex items-center gap-1.5">
                <p className="text-sm font-semibold leading-tight">
                  {customer?.name}
                </p>
                <ChevronsUpDown size={14} className="text-muted-foreground" />
              </div>
              <div className="flex gap-2 items-center">
                <p className="text-xs text-muted-foreground">
                  {customer?.phone}
                </p>
                <p className="text-xs text-muted-foreground truncate max-w-[120px]">
                  {customer?.email}
                </p>
              </div>
              {customer?.threadId && (
                <p className="text-[10px] h-3 font-mono text-muted-foreground">
                  Thread: {customer?.shortId}
                </p>
              )}
            </div>
          </div>

          {/* ACTION BUTTONS */}
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
              <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
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

        {/* QUICK SWITCHER */}
        <AnimatePresence>
          {showSwitcher && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="absolute top-[65px] left-0 w-full z-20 bg-background border-b shadow-lg overflow-hidden"
            >
              <ScrollArea className="max-h-[300px]">
                <div className="p-2 flex flex-col gap-1">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground px-2 py-1">
                    Switch Active Thread
                  </p>
                  {chatThreads.map((thread) => (
                    <div
                      key={thread.id}
                      onClick={() => {
                        openChat({
                          id: thread.customerId,
                          threadId: thread.id,
                          name: thread.customer?.name ?? "Unknown",
                          phone: thread.customer?.phone ?? undefined,
                          email: thread.customer?.email ?? undefined,
                          isAutoPilot: thread.isAutoPilot,
                          shortId: thread.shortId,
                        });
                        setShowSwitcher(false);
                      }}
                      className={`flex items-center justify-between p-2 hover:bg-muted/50 rounded-lg cursor-pointer transition-colors ${
                        customer?.threadId === thread.id ? "bg-muted" : ""
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-primary/10 text-primary text-[10px] font-bold">
                            {thread.customer?.name
                              ?.slice(0, 2)
                              .toUpperCase() ?? <UserRound size={14} />}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                          <span className="text-sm font-medium">
                            {thread.customer?.name ?? "Unknown"}
                          </span>
                          <span className="text-xs text-muted-foreground font-mono">
                            Thread: {thread.shortId}
                          </span>
                        </div>
                      </div>
                      {customer?.threadId === thread.id && (
                        <Badge variant="secondary" className="text-[10px]">
                          Active
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </motion.div>
          )}
        </AnimatePresence>

        {/* CHAT BODY */}
        <div
          className="flex-1 min-h-0 flex flex-col bg-slate-50/50 dark:bg-zinc-950/50"
          onClick={() => setShowSwitcher(false)}
        >
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
                      threadId={customer?.threadId}
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

        {/* INPUT */}
        <div
          className="shrink-0 bg-background border-t"
          onClick={() => setShowSwitcher(false)}
        >
          <OwnerAdvancedChatInput
            isLoading={isSendingSMS || isSendingEmail}
            onSend={handleSendMessage}
            clientId={customer?.id}
          
          />
        </div>
      </motion.div>
    </motion.div>
  );
}
