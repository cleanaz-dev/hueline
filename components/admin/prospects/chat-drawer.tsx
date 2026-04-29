"use client"

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, Send, ShieldAlert, UserRound, X } from "lucide-react";
import { MOCK_PROSPECTS } from "./mock-data";
import { ChatBubble } from "./chat-bubble";

export function ChatDrawer({ prospect, isOpen, onClose }: any) {
  const [messages, setMessages] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [input, setInput] = React.useState("");
  const bottomRef = React.useRef<HTMLDivElement>(null);

  const fetchMessages = () => {
    if (!prospect?.id) return;
    setLoading(true);
    const mock = MOCK_PROSPECTS.find((p: any) => p.id === prospect.id);
    setMessages(mock ? mock.communication : []);
    setLoading(false);
  };

  React.useEffect(() => {
    if (isOpen) fetchMessages();
  }, [isOpen, prospect?.id]);

  React.useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
    }
  }, [messages]);

  // Lock body scroll when open
  React.useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  const handleManualSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    await fetch("/api/admin/prospects/send-manual", {
      method: "POST",
      body: JSON.stringify({
        prospectId: prospect?.id,
        phone: prospect?.phone,
        body: input,
      }),
    });
    setInput("");
    fetchMessages();
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
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b bg-muted/30 shrink-0">
              <div className="flex items-center gap-3">
                <Avatar className="h-9 w-9">
                  <AvatarFallback className="bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-200 text-sm font-semibold">
                    {initials ?? <UserRound size={16} />}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-semibold leading-tight">{prospect.name}</p>
                  <p className="text-xs text-muted-foreground">{prospect.phone}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-[10px] px-2 py-0.5 font-normal text-muted-foreground">
                  {messages.length} messages
                </Badge>
                <Button variant="ghost" size="icon" onClick={fetchMessages} className="h-8 w-8">
                  <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
                </Button>
                <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
                  <X size={15} />
                </Button>
              </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 px-4">
              <div className="py-5 space-y-5">
                {messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-40 gap-2 text-muted-foreground">
                    <p className="text-sm">No messages yet</p>
                  </div>
                ) : (
                  messages.map((msg: any) => (
                    <ChatBubble key={msg.id} msg={msg} prospectName={prospect.name} />
                  ))
                )}
                <div ref={bottomRef} />
              </div>
            </ScrollArea>

            {/* Input */}
            <div className="px-4 pt-3 pb-4 border-t bg-background space-y-2.5 shrink-0">
              <form className="flex gap-2" onSubmit={handleManualSend}>
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Type a manual reply..."
                  className="flex-1 text-sm"
                />
                <Button type="submit" size="icon" disabled={!input.trim()} className="shrink-0">
                  <Send size={16} />
                </Button>
              </form>
              <div className="flex items-center gap-1.5 justify-center text-[10px] text-orange-500 font-medium">
                <ShieldAlert size={11} />
                Sending a manual reply pauses AI for 2 hours
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}