"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  Send,
  ShieldAlert,
  Sparkles,
  MessageSquare,
  Mail,
  CreditCard,
  Calendar,
  PaintRoller,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface AdvancedChatInputProps {
  onSend: (message: string, channel: "SMS" | "EMAIL") => void;
  isLoading?: boolean;
}

export function AdvancedChatInput({
  onSend,
  isLoading,
}: AdvancedChatInputProps) {
  const [text, setText] = React.useState("");
  const [channel, setChannel] = React.useState<"SMS" | "EMAIL">("SMS");

  const handleSend = () => {
    if (!text.trim()) return;
    onSend(text, channel);
    setText("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="p-4 bg-background border-t shadow-[0_-4px_15px_-5px_rgba(0,0,0,0.05)]">
      {/* TOOLBAR */}
      <div className="flex items-center justify-between mb-2">
        {/* Channel Switcher */}
        <div className="flex bg-muted/50 p-1 rounded-lg">
          <button
            onClick={() => setChannel("SMS")}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all",
              channel === "SMS"
                ? "bg-background shadow-sm text-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <MessageSquare size={13} /> SMS
          </button>
          <button
            onClick={() => setChannel("EMAIL")}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all",
              channel === "EMAIL"
                ? "bg-background shadow-sm text-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <Mail size={13} /> Email
          </button>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-1.5">
          {/* Will Inster Quick Actions Later */}
        </div>
      </div>

      {/* TEXT AREA */}
      <div
        className={cn(
          "relative rounded-xl border bg-background transition-colors focus-within:ring-1 focus-within:ring-ring",
          channel === "EMAIL"
            ? "border-blue-200 dark:border-blue-900"
            : "border-zinc-200 dark:border-zinc-800",
        )}
      >
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={channel === "SMS" ? "Text message..." : "Draft email..."}
          className="w-full min-h-20 max-h-50 p-3 text-sm bg-transparent resize-none focus:outline-none scrollbar-thin"
        />

        {/* Bottom Area inside Text Container */}
        <div className="flex justify-end p-2 pt-0 mt-1">

          {/* Send Button */}
          <Button
            onClick={handleSend}
            disabled={!text.trim() || isLoading}
            size="sm"
            className="h-8 gap-2 rounded-lg"
          >
            <span>Send</span>
            <Send size={14} />
          </Button>
        </div>
      </div>

      {/* Warning Message */}
      <div className="flex items-center justify-center gap-1.5 mt-3 text-[10px] text-orange-500 font-medium opacity-80">
        <ShieldAlert size={12} />
        Manual replies pause the AI bot for 2 hours
      </div>
    </div>
  );
}
