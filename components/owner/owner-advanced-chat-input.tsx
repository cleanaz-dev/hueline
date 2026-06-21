"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send,
  MessageSquare,
  Mail,
  Loader2,
  X,
  Sparkles,
  PhoneCall,
  Phone,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { RichTextEditor } from "../admin/prospects/rich-text-editor";
import { AiActionDock } from "../admin/prospects/ai-action-dock";
import { useOwner } from "@/context/owner-context";
import { HueClawChatControls } from "./hueclaw/hueclaw-chat-controls";
import { DialChannelInput } from "./dial-input-channel";
import OmniChannelActionButton from "./omni-channel-actions-button";

interface OwnerAdvancedChatInputProps {
  isLoading: boolean;
  onSend: (
    message: string,
    channel: "SMS" | "EMAIL" | "DIAL",
    subject?: string,
    customerPhone?: string, // <-- Add this
    operatorPhone?: string, // <-- Add this
  ) => void;
  clientId?: string;
}

export function OwnerAdvancedChatInput({
  clientId,
  onSend,
  isLoading,
}: OwnerAdvancedChatInputProps) {
  const {
    aiSuggestions,
    isAiLoading,
    activeThread,
    hueClawAi,
    isDialing,
    me,
    isMeLoading,
  } = useOwner();

  const [text, setText] = useState("");
  const [subject, setSubject] = useState("");
  const [channel, setChannel] = useState<"SMS" | "EMAIL" | "DIAL">("SMS");
  const [isUndocked, setIsUndocked] = useState<boolean>(false);
  const [isAutoPilot, setIsAutoPilot] = useState<boolean>(
    activeThread?.isAutoPilot ?? false,
  );
  const [customerPhoneNumber, setCustomerPhoneNumber] = useState<string>("");
  const [operatorNumber, setOperatorNumber] = useState<string>(me?.phone ?? "");

  useEffect(() => {
    setIsAutoPilot(activeThread?.isAutoPilot ?? false);
  }, [activeThread?.isAutoPilot]);

  useEffect(() => {
    if (me?.phone && !operatorNumber) {
      setOperatorNumber(me.phone);
    }
  }, [me?.phone, operatorNumber]);

  // const currentSuggestion =
  //   clientId && aiSuggestions ? aiSuggestions[clientId] : null;

  const handleSend = () => {
    // If dialing, bypass the text check
    if (channel === "DIAL") {
      // Pass the new variables here!
      onSend("", "DIAL", undefined, customerPhoneNumber, operatorNumber);
      return;
    }

    const plainText = text.replace(/<[^>]*>?/gm, "").trim();
    if (!plainText) return;

    // You can pass them here too just so the arguments line up
    onSend(
      text,
      channel,
      channel === "EMAIL" ? subject : undefined,
      customerPhoneNumber,
      operatorNumber,
    );

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

  const handleSwitchChannel = (newChannel: "SMS" | "EMAIL" | "DIAL") => {
    if (channel !== newChannel) {
      setChannel(newChannel);
      setText("");
      setSubject("");
      setIsUndocked(false);
    }
  };

  const handleHangUp = async () => (
    console.log("Hangup")
  )

  // Allow dialing even if text is empty, as long as a number exists
  const isEmpty =
    channel === "DIAL"
      ? !customerPhoneNumber && !activeThread?.phone
      : !text.replace(/<[^>]*>?/gm, "").trim();

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
              className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm hidden md:block"
              onClick={() => setIsUndocked(false)}
            />

            <motion.div
              key="email-composer"
              initial={{ opacity: 0, scale: 0.96, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 16 }}
              transition={{ duration: 0.22, ease: [0.32, 0.72, 0, 1] }}
              className="fixed z-[61] hidden md:flex flex-col"
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

                {/* Undocked subject field */}
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

                <div className="flex justify-end px-3 py-2.5 border-t bg-muted/20">
                  {/* Undocked send button */}
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
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ─── Docked input (always visible) ───────────────────────────────── */}
      <div className="p-4 bg-background border-t shadow-[0_-4px_15px_-5px_rgba(0,0,0,0.05)]">
        {/* <AiActionDock
          isLoading={isAiLoading}
          suggestion={currentSuggestion}
          onAnalyze={() =>
            clientId &&
            fetchAiSuggestion &&
            fetchAiSuggestion(clientId, activeThread?.threadId!)
          }
          onClear={() =>
            clientId &&
            clearAiSuggestion &&
            clearAiSuggestion(clientId, activeThread?.threadId!)
          }
          onUseSms={(aiText) => {
            setChannel("SMS");
            setSubject("");
            setText(aiText);
            setIsUndocked(false);
          }}
          onUseEmail={(aiSubject, aiBody) => {
            setChannel("EMAIL");
            setSubject(aiSubject);
            setText(aiBody);
            setIsUndocked(false);
          }}
        /> */}

        {/* Channel Switcher & AI Controls (h-10 locks the height so no bouncing) */}
        <div className="flex items-center justify-between h-10 mb-2">
          <div className="flex bg-muted/50 p-1 rounded-lg h-8 border border-border/50">
            <button
              onClick={() => handleSwitchChannel("SMS")}
              className={cn(
                "flex items-center gap-1.5 px-3 rounded-md text-xs font-medium transition-all h-full",
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
                "flex items-center gap-1.5 px-3 rounded-md text-xs font-medium transition-all h-full",
                channel === "EMAIL"
                  ? "bg-background shadow-sm text-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <Mail size={13} /> Email
            </button>
            <button
              onClick={() => handleSwitchChannel("DIAL")}
              className={cn(
                "flex items-center gap-1.5 px-3 rounded-md text-xs font-medium transition-all h-full",
                channel === "DIAL"
                  ? "bg-background shadow-sm text-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <PhoneCall size={13} /> Dial
            </button>
          </div>

          <HueClawChatControls
            isAutoPilot={isAutoPilot} // ✅ Read from your local state so the switch moves instantly!
            setIsAutoPilot={setIsAutoPilot}
            isAiLoading={isAiLoading}
            customerId={clientId}
            threadId={activeThread?.threadId}
            onNudge={() =>
              hueClawAi(clientId!, activeThread?.threadId!, "nudge")
            }
          />
        </div>

        {/* Input Area */}
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
            ) : channel === "EMAIL" ? (
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

                {/* Docked subject field */}
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
              </motion.div>
            ) : (
              <DialChannelInput
                key="dial"
                customerPhoneNumber={customerPhoneNumber}
                setCustomerPhoneNumber={setCustomerPhoneNumber}
                activeThreadPhone={activeThread?.phone}
                isLoading={isLoading}
                operatorNumber={operatorNumber}
                setOperatorNumber={setOperatorNumber}
                isDialing={isDialing}
              />
            )}
          </AnimatePresence>

          <OmniChannelActionButton
            channel={channel}
            isEmpty={isEmpty}
            isLoading={isLoading}
            isDialing={isDialing}
            onSend={handleSend}
            customerId={activeThread?.id!}
            threadId={activeThread?.threadId!}
          />
        </motion.div>
      </div>
    </>
  );
}
