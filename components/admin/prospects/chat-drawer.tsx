"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, Send, ShieldAlert, UserRound, X } from "lucide-react";
import { ChatBubble } from "./chat-bubble";
import { AdvancedChatInput } from "./advanced-chat-input";
import { useSuperAdmin } from "@/context/super-admin-context";

export function ChatDrawer({ prospect, isOpen, onClose }: any) {
  const [messages, setMessages] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [input, setInput] = React.useState("");
  const bottomRef = React.useRef<HTMLDivElement>(null);

  const { sendSMS, sendEmail, isSendingSMS, isSendingEmail } = useSuperAdmin();

  const fetchMessages = async () => {
    if (!prospect?.id) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/prospects/${prospect.id}/messages`);
      const data = await res.json();
      setMessages(data);
    } catch (err) {
      console.error("Fetch error", err);
      setMessages([]);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    if (isOpen) fetchMessages();
  }, [isOpen, prospect?.id]);

  React.useEffect(() => {
    if (messages.length > 0) {
      setTimeout(
        () => bottomRef.current?.scrollIntoView({ behavior: "smooth" }),
        50,
      );
    }
  }, [messages]);

  // Lock body scroll when open
  React.useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const handleSendMessage = async (
    message: string,
    channel: "SMS" | "EMAIL",
  ) => {
    let success = false;

    if (channel === "SMS") {
      success = await sendSMS(prospect.id, message);
    } else {
      success = await sendEmail(prospect.id, message, "Quote Update");
    }

    // 2. If the context says it successfully fired, fetch the new thread!
    if (success) {
      fetchMessages();
    } else {
      // You could trigger a toast notification here: toast.error("Failed to send message")
      console.warn("Error Sending To Prospect");
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
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="fixed inset-0 z-50 bg-black/50"
            onClick={onClose}
          />

          {/* Drawer panel */}
          <motion.div
            key="drawer"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.35, ease: [0.32, 0.72, 0, 1] }}
            className="fixed inset-y-0 right-0 z-50 flex flex-col w-full sm:max-w-105 bg-background shadow-2xl border-l"
          >
            {/* Header (Stays Fixed Top) */}
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
                <Badge
                  variant="outline"
                  className="text-[10px] px-2 py-0.5 font-normal text-muted-foreground"
                >
                  {messages.length} messages
                </Badge>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={fetchMessages}
                  className="h-8 w-8"
                >
                  <RefreshCw
                    size={15}
                    className={loading ? "animate-spin" : ""}
                  />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  className="h-8 w-8"
                >
                  <X size={15} />
                </Button>
              </div>
            </div>

            {/* Messages (Scrollable Area) */}
            {/* THE FIX: Added flex-1 and min-h-0 wrapper here */}
            <div className="flex-1 min-h-0 flex flex-col">
              {/* THE FIX: Added h-full to the ScrollArea */}
              <ScrollArea className="h-full px-4">
                <div className="py-5 space-y-5">
                  {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-40 gap-2 text-muted-foreground">
                      <p className="text-sm">No messages yet</p>
                    </div>
                  ) : (
                    messages.map((msg: any) => (
                      <ChatBubble
                        key={msg.id}
                        msg={msg}
                        prospectName={prospect.name}
                      />
                    ))
                  )}
                  <div ref={bottomRef} className="h-1" />
                </div>
              </ScrollArea>
            </div>

            {/* Input (Stays Fixed Bottom) */}
            <div className="shrink-0">
              <AdvancedChatInput
                isLoading={isSendingSMS || isSendingEmail}
                onSend={handleSendMessage}
              />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
