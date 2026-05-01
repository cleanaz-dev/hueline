"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { Send, MessageSquare, Mail, Loader2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { RichTextEditor } from "./rich-text-editor";

interface AdvancedChatInputProps {
  onSend: (message: string, channel: "SMS" | "EMAIL", subject?: string) => void;
  isLoading?: boolean;
}

export function AdvancedChatInput({
  onSend,
  isLoading,
}: AdvancedChatInputProps) {
  const [text, setText] = React.useState("");
  const [subject, setSubject] = React.useState("");
  const [channel, setChannel] = React.useState<"SMS" | "EMAIL">("SMS");
  const [isUndocked, setIsUndocked] = React.useState(false);

  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  const handleSend = () => {
    const plainText = text.replace(/<[^>]*>?/gm, "").trim();
    if (!plainText) return;
    onSend(text, channel, channel === "EMAIL" ? subject : undefined);
    setText("");
    setSubject("");
    setIsUndocked(false);
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
      setSubject("");
      setIsUndocked(false);
    }
  };
  const isEmpty = !text.replace(/<[^>]*>?/gm, "").trim();

  // ─── Subject field (shared between docked + undocked) ─────────────────────
  const SubjectField = () => (
    <div className="flex items-center border-t border-border/50">
      <span className="text-xs text-muted-foreground px-3 border-r border-border/50 h-9 flex items-center shrink-0">
        Subject
      </span>
      <input
        type="text"
        value={subject}
        onChange={(e) => setSubject(e.target.value)}
        placeholder="Add a subject…"
        disabled={isLoading}
        className="flex-1 h-9 px-3 text-sm bg-transparent focus:outline-none placeholder:text-muted-foreground/60 disabled:opacity-50"
      />
    </div>
  );

  // ─── Send button (shared) ──────────────────────────────────────────────────
  const SendButton = () => (
    <Button
      onClick={handleSend}
      disabled={isEmpty || isLoading}
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
  );

  return (
    <>
      {/* ─── Undocked overlay — md+ only ─────────────────────────────────── */}
      <AnimatePresence>
        {isUndocked && channel === "EMAIL" && (
          <>
            <motion.div
              key="email-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-60 bg-black/40 backdrop-blur-sm hidden md:block"
              onClick={() => setIsUndocked(false)}
            />

            <motion.div
              key="email-composer"
              initial={{ opacity: 0, scale: 0.96, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 16 }}
              transition={{ duration: 0.22, ease: [0.32, 0.72, 0, 1] }}
              className="fixed z-61 hidden md:flex flex-col"
              style={{
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                width: "min(680px, 90vw)",
              }}
            >
              <div className="flex flex-col rounded-2xl border bg-background shadow-2xl overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 border-b bg-muted/30">
                  <div className="flex items-center gap-2">
                    <Mail size={14} className="text-muted-foreground" />
                    <span className="text-sm font-medium">Email Composer</span>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-muted-foreground"
                    onClick={() => setIsUndocked(false)}
                  >
                    <X size={14} />
                  </Button>
                </div>

                <RichTextEditor
                  value={text}
                  onChange={setText}
                  disabled={isLoading}
                  isUndocked={true}
                  onDock={() => setIsUndocked(false)}
                />

                {/* Subject sits flush below the editor */}
                <SubjectField />

                <div className="flex justify-end px-3 py-2.5 border-t bg-muted/20">
                  <SendButton />
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ─── Docked input (always visible) ───────────────────────────────── */}
      <div className="p-4 bg-background border-t shadow-[0_-4px_15px_-5px_rgba(0,0,0,0.05)]">
        <div className="flex items-center justify-between mb-2">
          <div className="flex bg-muted/50 p-1 rounded-lg">
            <button
              onClick={() => handleSwitchChannel("SMS")}
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
              onClick={() => handleSwitchChannel("EMAIL")}
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
        </div>

        <motion.div
          layout
          className={cn(
            "relative flex flex-col rounded-xl border bg-background transition-colors focus-within:ring-1 focus-within:ring-ring overflow-hidden",
            channel === "EMAIL"
              ? "border-blue-200 dark:border-blue-900 shadow-sm"
              : "border-zinc-200 dark:border-zinc-800",
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
                  disabled={isLoading || isUndocked}
                  isUndocked={false}
                  onUndock={() => setIsUndocked(true)}
                />

                {/* Subject sits flush below the editor, above the send bar */}
                <SubjectField />
              </motion.div>
            )}
          </AnimatePresence>

          <motion.div
            layout
            className="flex justify-end p-2 pt-0 mt-1 bg-background shrink-0"
          >
            <SendButton />
          </motion.div>
        </motion.div>
      </div>
    </>
  );
}
