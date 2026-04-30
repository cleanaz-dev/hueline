"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { Send, ShieldAlert, MessageSquare, Mail, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { RichTextEditor } from "./rich-text-editor"; // Adjust path as needed

interface AdvancedChatInputProps {
  onSend: (message: string, channel: "SMS" | "EMAIL") => void;
  isLoading?: boolean;
}

export function AdvancedChatInput({ onSend, isLoading }: AdvancedChatInputProps) {
  const [text, setText] = React.useState("");
  const [channel, setChannel] = React.useState<"SMS" | "EMAIL">("SMS");

  const handleSend = () => {
    // Strip HTML tags to check if it's purely empty space
    const plainText = text.replace(/<[^>]*>?/gm, "").trim();
    if (!plainText) return;
    
    onSend(text, channel);
    setText(""); // The editor's useEffect will automatically clear it when this happens
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey && channel === "SMS") {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSwitchChannel = (newChannel: "SMS" | "EMAIL") => {
    if (channel !== newChannel) {
      setChannel(newChannel);
      setText("");
    }
  };

  return (
    <div className="p-4 bg-background border-t shadow-[0_-4px_15px_-5px_rgba(0,0,0,0.05)]">
      {/* CHANNEL TABS */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex bg-muted/50 p-1 rounded-lg">
          <button
            onClick={() => handleSwitchChannel("SMS")}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all",
              channel === "SMS"
                ? "bg-background shadow-sm text-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <MessageSquare size={13} /> SMS
          </button>
          <button
            onClick={() => handleSwitchChannel("EMAIL")}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all",
              channel === "EMAIL"
                ? "bg-background shadow-sm text-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Mail size={13} /> Email
          </button>
        </div>
      </div>

      {/* INPUT AREA */}
      <motion.div
        layout
        className={cn(
          "relative flex flex-col rounded-xl border bg-background transition-colors focus-within:ring-1 focus-within:ring-ring overflow-hidden",
          channel === "EMAIL"
            ? "border-blue-200 dark:border-blue-900 shadow-sm"
            : "border-zinc-200 dark:border-zinc-800"
        )}
      >
        <AnimatePresence mode="wait">
          {channel === "SMS" ? (
            <motion.div
              key="sms"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Text message..."
                className="w-full min-h-20 max-h-50 p-3 text-sm bg-transparent resize-none focus:outline-none scrollbar-thin"
                disabled={isLoading}
              />
            </motion.div>
          ) : (
            <motion.div
              key="email"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="flex flex-col w-full"
            >
              <RichTextEditor
                value={text}
                onChange={setText}
                disabled={isLoading}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* BOTTOM ACTION BAR */}
        <motion.div layout className="flex justify-end p-2 pt-0 mt-1 bg-background shrink-0">
          <Button
            onClick={handleSend}
            disabled={!text.replace(/<[^>]*>?/gm, "").trim() || isLoading}
            size="sm"
            className="h-8 gap-2 rounded-lg"
          >
            {isLoading ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                <span>Sending...</span>
              </>
            ) : (
              <>
                <span>Send</span>
                <Send size={14} />
              </>
            )}
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
}