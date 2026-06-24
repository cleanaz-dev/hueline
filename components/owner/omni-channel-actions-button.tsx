import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Phone, PhoneOff, Send, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useOwner } from "@/context/owner-context";

const DIAL_COUNTDOWN_SECONDS = 5;

interface OmniChannelActionButtonProps {
  channel: "DIAL" | "SMS" | "EMAIL";
  isEmpty: boolean;
  isLoading: boolean;
  isDialing: boolean;
  onSend: () => void;
  customerId: string;
  threadId: string;
}

export default function OmniChannelActionButton({
  channel,
  isEmpty,
  isLoading,
  isDialing,
  onSend,
  customerId,
  threadId,
}: OmniChannelActionButtonProps) {
  const isBusy = isLoading || isDialing;
  const { handleHangUpCall, isCancellingCall } = useOwner();

  const [countdown, setCountdown] = useState<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearCountdown = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setCountdown(null);
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  useEffect(() => {
    if (countdown === 0) {
      clearCountdown();
      onSend();
    }
  }, [countdown]);

  const handleMainClick = () => {
    if (channel === "DIAL") {
      setCountdown(DIAL_COUNTDOWN_SECONDS);
      timerRef.current = setInterval(() => {
        setCountdown((prev) => {
          if (prev === null) return null;
          if (prev <= 1) return 0;
          return prev - 1;
        });
      }, 1000);
      return;
    }
    onSend();
  };

  const handleCancelCountdown = () => {
    clearCountdown();
  };

  const handleHangUp = async () => {
    try {
      await handleHangUpCall(customerId, threadId);
    } catch (error) {
      console.error(error);
    }
  };

  const isCountingDown = countdown !== null;

  return (
    <motion.div
      layout
      className="flex justify-end gap-2 p-2 pt-0 mt-1 bg-background shrink-0"
    >
      {isBusy && !isCountingDown && (
        <Button
          onClick={handleHangUp}
          disabled={isCancellingCall}
          variant="destructive"
          size="sm"
          className="h-8 gap-2 rounded-lg"
        >
          {isCancellingCall ? (
            <>
              <Loader2 size={14} className="animate-spin" />
              <span>Hanging Up...</span>
            </>
          ) : (
            <>
              <PhoneOff size={14} />
              <span>Hang Up</span>
            </>
          )}
        </Button>
      )}

      <AnimatePresence mode="wait" initial={false}>
        {isCountingDown ? (
          <motion.div
            key="countdown"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="flex h-8 items-center gap-2 rounded-lg border bg-muted px-3 text-sm font-medium"
          >
            <span className="tabular-nums text-muted-foreground">
              Dialing in {countdown}...
            </span>
            <button
              type="button"
              onClick={handleCancelCountdown}
              aria-label="Cancel dial"
              className="cursor-pointer rounded-full p-0.5 text-destructive hover:bg-destructive/10 transition-colors"
            >
              <X size={14} />
            </button>
          </motion.div>
        ) : (
          <motion.div
            key="action"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.15 }}
          >
            <Button
              onClick={handleMainClick}
              disabled={isEmpty || isBusy}
              size="sm"
              className="h-8 gap-2 rounded-lg"
            >
              {isBusy ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  <span>
                    {channel === "DIAL" ? "Dialing..." : "Sending..."}
                  </span>
                </>
              ) : (
                <>
                  <span>{channel === "DIAL" ? "Dial" : "Send"}</span>
                  {channel === "DIAL" ? (
                    <Phone size={14} />
                  ) : (
                    <Send size={14} />
                  )}
                </>
              )}
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}