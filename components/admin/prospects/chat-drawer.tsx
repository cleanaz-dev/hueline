"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, UserRound, X } from "lucide-react";
import { ChatBubble } from "./chat-bubble";
import { AdvancedChatInput } from "./advanced-chat-input";
import { useSuperAdmin } from "@/context/super-admin-context";
import { DrawerToast } from "./drawer-toast";

export function ChatDrawer({ prospect, isOpen, onClose }: any) {
  const[messages, setMessages] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(false);
  
  const bottomRef = React.useRef<HTMLDivElement>(null);
  const prevMessageCount = React.useRef(0); // Protects against annoying auto-scrolls during polling

  const {
    sendSMS,
    sendEmail,
    isSendingSMS,
    isSendingEmail,
    smsSuccess,
    emailSuccess,
    pendingMessages
  } = useSuperAdmin();

  const prospectPendingMessages = pendingMessages.filter((m) => m.prospectId === prospect?.id);

  // ─── FETCH & POLLING ────────────────────────────────────────────────────────
  const fetchMessages = async (isBackgroundPoll = false) => {
    if (!prospect?.id) return;
    if (!isBackgroundPoll) setLoading(true); // Only show spinner on manual button click

    try {
      const res = await fetch(`/api/admin/prospects/${prospect.id}/messages`);
      const data = await res.json();
      setMessages(data);
    } catch (err) {
      console.error("Fetch error", err);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    if (!isOpen || !prospect?.id) return;

    fetchMessages();

    // The temporary MVP polling (we will replace this with Pusher/Redis later)
    const pollInterval = setInterval(() => {
      fetchMessages(true);
    }, 10000);

    return () => clearInterval(pollInterval);
  },[isOpen, prospect?.id]);

  // ─── COMBINE & SCROLL ───────────────────────────────────────────────────────
  const combinedMessages = React.useMemo(() => {
    return[
      ...messages,
      ...prospectPendingMessages.map(m => ({ ...m, isPending: true }))
    ];
  },[messages, prospectPendingMessages]);

  React.useEffect(() => {
    // ONLY scroll down if the actual length of the chat grew
    if (combinedMessages.length > prevMessageCount.current) {
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    }
    prevMessageCount.current = combinedMessages.length;
  }, [combinedMessages.length]);

  React.useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  // ─── SEND LOGIC ─────────────────────────────────────────────────────────────
  const handleSendMessage = async (message: string, channel: "SMS" | "EMAIL") => {
    // Instantly force scroll so they see their pending message pop in
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 50);

    let success = false;
    if (channel === "SMS") {
      success = await sendSMS(prospect.id, message);
    } else {
      success = await sendEmail(prospect.id, message, "Quote Update");
    }

    if (success) {
      fetchMessages(); 
    }
  };

  const initials = prospect?.name
    ?.split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <AnimatePresence>
      {isOpen && prospect && (
        <>
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="fixed inset-0 z-50 bg-black/50"
            onClick={onClose}
          />

          <motion.div
            key="drawer"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.35, ease:[0.32, 0.72, 0, 1] }}
            className="fixed inset-y-0 right-0 z-50 flex flex-col w-full sm:max-w-[420px] md:max-w-[480px] bg-background shadow-2xl border-l"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b bg-muted/30 shrink-0">
              <div className="flex items-center gap-3">
                <Avatar className="h-9 w-9">
                  <AvatarFallback className="bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-200 text-sm font-semibold">
                    {initials ?? <UserRound size={16} />}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-semibold leading-tight">
                    {prospect.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {prospect.phone}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-[10px] px-2 py-0.5 font-normal text-muted-foreground">
                  {messages.length} messages
                </Badge>
                <Button variant="ghost" size="icon" onClick={() => fetchMessages()} className="h-8 w-8">
                  <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
                </Button>
                <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
                  <X size={15} />
                </Button>
              </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 min-h-0 flex flex-col">
              <ScrollArea className="h-full px-4">
                <div className="py-5 space-y-1"> {/* Reduced space-y since margins are handled in the bubble */}
                  {combinedMessages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-40 gap-2 text-muted-foreground">
                      <p className="text-sm">No messages yet</p>
                    </div>
                  ) : (
                    <>
                      {/* 🔥 THE GROUPING LOGIC IN THE MAP 🔥 */}
                      {combinedMessages.map((msg: any, index: number) => {
                        const prevMsg = combinedMessages[index - 1];
                        const nextMsg = combinedMessages[index + 1];

                        // Starts group if it's the first message, a new sender, or a new medium (SMS vs Email)
                        const isGroupStart = 
                          !prevMsg || 
                          prevMsg.role !== msg.role || 
                          prevMsg.type !== msg.type;

                        // Ends group if it's the last message, or the next message breaks the chain
                        const isGroupEnd = 
                          !nextMsg || 
                          nextMsg.role !== msg.role || 
                          nextMsg.type !== msg.type;

                        return (
                          <ChatBubble 
                            key={msg.id || index} 
                            msg={msg} 
                            prospectName={prospect.name} 
                            prospectId={prospect.id}
                            isPending={msg.isPending}
                            isGroupStart={isGroupStart}
                            isGroupEnd={isGroupEnd}
                          />
                        );
                      })}
                    </>
                  )}
                  <div ref={bottomRef} className="h-2" />
                </div>
              </ScrollArea>
            </div>

            {/* Input Area */}
            <div className="shrink-0">
              <AdvancedChatInput
                isLoading={isSendingSMS || isSendingEmail}
                onSend={handleSendMessage}
                clientId={prospect.id}
              />
            </div>

            <DrawerToast message={smsSuccess ?? emailSuccess} />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}