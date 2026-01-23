"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowRight, Video, Percent, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BookingData } from "@/types/subdomain-type";
import { cn } from "@/lib/utils";

type NudgeState = "HIDDEN" | "TEASER" | "IDLE" | "DIALOG";

const SPLASH_DURATION = 3000;
const TEASER_VISIBLE_DURATION = 5000;

export const SurveyNudge = ({ booking }: { booking: BookingData }) => {
  const [viewState, setViewState] = useState<NudgeState>("HIDDEN");

  const hasCompletedSurvey = booking.rooms?.some(
    (room: any) => room.sessionType === "SELF_SERVE",
  );

  useEffect(() => {
    if (hasCompletedSurvey) return;

    const entryTimer = setTimeout(() => {
      setViewState("TEASER");
    }, SPLASH_DURATION + 500);

    const idleTimer = setTimeout(
      () => {
        setViewState((prev) => (prev === "TEASER" ? "IDLE" : prev));
      },
      SPLASH_DURATION + 500 + TEASER_VISIBLE_DURATION,
    );

    return () => {
      clearTimeout(entryTimer);
      clearTimeout(idleTimer);
    };
  }, [hasCompletedSurvey]);

  const scrollToSurvey = () => {
    const element = document.getElementById("quote-survey-section");
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "center" });
    }
    setViewState("IDLE");
  };

  if (hasCompletedSurvey) return null;

  return (
    <>
      {/* --- CLICK ANYWHERE TO CLOSE OVERLAY --- */}
      <AnimatePresence>
        {viewState === "DIALOG" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setViewState("IDLE")}
            className="fixed inset-0 z-[55] bg-black/5 backdrop-blur-[2px] pointer-events-auto"
          />
        )}
      </AnimatePresence>

      <div className="fixed bottom-8 right-0 z-[60] flex flex-col items-end pointer-events-none">
        <AnimatePresence mode="wait">
          {/* --- PREMIUM DIALOG CARD --- */}
          {viewState === "DIALOG" && (
            <motion.div
              key="dialog"
              initial={{ y: 20, opacity: 0, scale: 0.95 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 20, opacity: 0, scale: 0.95 }}
              transition={{ type: "spring", bounce: 0.3, duration: 0.6 }}
              className="pointer-events-auto bg-white border border-gray-100 shadow-[0_20px_50px_rgba(0,0,0,0.15)] rounded-[24px] p-7 w-[340px] mb-4 mr-6 overflow-hidden relative"
            >
              {/* Decorative Background Glow */}
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-gray-50 rounded-full blur-3xl -z-10" />

              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-black flex items-center justify-center shadow-lg shadow-black/20 rotate-3">
                    <Sparkles size={20} className="text-white" />
                  </div>
                  <div>
                    <h4 className="font-bold text-base text-gray-900 leading-tight">
                      Exclusive Offer
                    </h4>
                    <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.15em] mt-0.5">
                      Limited Time
                    </p>
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setViewState("IDLE");
                  }}
                  className="text-gray-300 hover:text-black transition-colors p-1"
                >
                  <X size={20} />
                </button>
              </div>

              <p className="text-[15px] text-gray-600 mb-6 leading-relaxed">
                Complete your survey now to unlock your{" "}
                <span className="text-black font-bold underline decoration-gray-200 underline-offset-4">
                  15% discount
                </span>{" "}
                and get your quote faster.
              </p>

              <Button
                onClick={scrollToSurvey}
                className="w-full bg-black hover:bg-gray-800 text-white font-bold h-14 rounded-2xl text-md transition-all active:scale-[0.98] shadow-xl shadow-black/10"
              >
                Start Survey <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </motion.div>
          )}

          {/* --- THE PREMIUM CAPSULE --- */}
          {(viewState === "IDLE" || viewState === "TEASER") && (
            <motion.button
              key="toggle"
              layout
              onClick={() => setViewState("DIALOG")}
              onMouseEnter={() => setViewState("TEASER")}
              onMouseLeave={() => setViewState("IDLE")}
              initial={{ x: 100, opacity: 0 }}
              animate={{
                x: 0,
                opacity: 1,
                // Premium Gradient Change
                background:
                  viewState === "TEASER"
                    ? "linear-gradient(90deg, #ffffff 0%, #f9fafb 100%)"
                    : "rgba(255, 255, 255, 0.25)",
              }}
              exit={{ x: 100, opacity: 0 }}
              transition={{ type: "spring", bounce: 0, duration: 0.6 }}
              className={cn(
                "pointer-events-auto group flex items-center h-16 rounded-l-full overflow-hidden border-none pl-1 backdrop-blur-md",
                viewState === "TEASER"
                  ? "shadow-[0_15px_45px_rgba(0,0,0,0.12)]"
                  : "shadow-[0_8px_25px_rgba(0,0,0,0.06)]",
              )}
            >
              {/* Icon Container */}
              <div className="w-14 h-14 flex items-center justify-center flex-shrink-0 relative z-20">
                <div
                  className={cn(
                    "w-11 h-11 rounded-full flex items-center justify-center transition-all duration-500 shadow-sm",
                    viewState === "TEASER"
                      ? "bg-black text-white scale-110 rotate-[360deg]"
                      : "bg-gray-50 text-gray-400 group-hover:bg-black group-hover:text-white group-hover:rotate-12",
                  )}
                >
                  <Video size={20} />
                </div>

                {/* Animated Pulse Dot */}
                <AnimatePresence>
                  {viewState === "IDLE" && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      className="absolute top-2 right-2 flex h-3.5 w-3.5"
                    >
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-300 "></span>
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>

              {/* Premium Expanded Content */}
              <motion.div
                layout
                initial={false}
                animate={{
                  width: viewState === "TEASER" ? "auto" : 0,
                  opacity: viewState === "TEASER" ? 1 : 0,
                }}
                transition={{ type: "spring", bounce: 0, duration: 0.5 }}
                className="overflow-hidden whitespace-nowrap"
              >
                <div className="pr-8 pl-2 flex flex-col items-start cursor-pointer">
                  <span className="text-sm font-black text-gray-900 tracking-tight leading-none mb-1 group-hover:underline">
                    Complete Survey
                  </span>
                  <div className="flex items-center gap-1">
                    <span className="text-[11px] text-gray-400 font-bold uppercase tracking-wider group-hover:underline">
                      Get quote faster
                    </span>
                    <Sparkles
                      size={10}
                      className="text-yellow-500 fill-yellow-500"
                    />
                  </div>
                </div>
              </motion.div>
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </>
  );
};
