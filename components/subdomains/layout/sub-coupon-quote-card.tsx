"use client";

import { useState, useEffect, useRef } from "react";
import {
  Clock,
  Copy,
  Check,
  ArrowRight,
  Sparkles,
  Gift,
  PartyPopper,
  Lock,
  Unlock,
  Fingerprint,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { BookingData } from "@/types/subdomain-type";
import { QuoteSurvey } from "./quote-survey";

export const SubCouponQuoteCards = ({ booking }: { booking: BookingData }) => {
  const [timeLeft, setTimeLeft] = useState(72 * 60 * 60);
  const [copied, setCopied] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [holdProgress, setHoldProgress] = useState(0);
  const [isHolding, setIsHolding] = useState(false);
  const holdTimerRef = useRef<NodeJS.Timeout | null>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  const PROMO_CODE = "WELCOME15"; // Single source of truth
  const HOLD_DURATION = 5; // 5 seconds

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      if (holdTimerRef.current) clearTimeout(holdTimerRef.current);
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    };
  }, []);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const startHold = () => {
    if (isUnlocked) return;
    
    setIsHolding(true);
    setHoldProgress(0);
    
    // Start progress increment
    progressIntervalRef.current = setInterval(() => {
      setHoldProgress((prev) => {
        const newProgress = prev + (100 / (HOLD_DURATION * 10)); // Update every 100ms
        if (newProgress >= 100) {
          // Progress complete - unlock!
          clearInterval(progressIntervalRef.current!);
          clearTimeout(holdTimerRef.current!);
          setIsUnlocked(true);
          setIsHolding(false);
          setHoldProgress(100);
          
          // Show success toast
          toast.success("Offer Unlocked! 🎉", {
            description: `Your code ${PROMO_CODE} is now available`,
            duration: 4000,
            icon: <Unlock className="w-4 h-4" />,
          });
          
          return 100;
        }
        return newProgress;
      });
    }, 100);
    
    // Set safety timeout
    holdTimerRef.current = setTimeout(() => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
      setIsHolding(false);
      setHoldProgress(0);
    }, HOLD_DURATION * 1000);
  };

  const cancelHold = () => {
    if (isUnlocked) return;
    
    setIsHolding(false);
    setHoldProgress(0);
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
    }
    if (holdTimerRef.current) {
      clearTimeout(holdTimerRef.current);
    }
  };

  const handleCopy = () => {
    if (!isUnlocked) {
      toast.error("Locked", {
        description: "Press and hold to unlock your promo code first",
        duration: 2000,
      });
      return;
    }
    
    navigator.clipboard.writeText(PROMO_CODE);
    setCopied(true);
    toast.success("Promo code copied!", {
      description: `Use ${PROMO_CODE} at checkout`,
      duration: 2000,
    });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section className="w-full max-w-5xl mx-auto py-12 px-1 md:px-0">
      {/* --- 1. SECTION HEADER --- */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
        <div>
          <h1 className="text-xs font-bold uppercase tracking-widest">
            AUTOMATED QUOTE & OFFER
          </h1>
          <h2 className="text-2xl md:text-4xl font-bold text-black">
            Generated Client <span className="text-primary">Assets</span>
          </h2>
        </div>
      </div>

      {/* --- 2. THE GRID --- */}
      <div className="grid md:grid-cols-2 gap-6 lg:gap-8">
        {/* --- LEFT: THE OFFER (Ticket Style) --- */}
        <Card className="relative overflow-hidden border-0 bg-white shadow-xl shadow-blue-900/10 rounded-3xl flex flex-col h-full transform transition-all hover:translate-y-[-2px]">
          {isUnlocked && (
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-green-400 to-emerald-500 rounded-bl-3xl opacity-10" />
          )}
          
          <div className="p-6 md:p-8 flex-1 flex flex-col">
            <div className="flex justify-between items-start mb-6">
              <div>
                <p className="text-xs font-bold tracking-widest text-gray-400 uppercase mb-1">
                  {isUnlocked ? "✓ Unlocked" : "🔒 Locked Offer"}
                </p>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
                  15% Off
                  {!isUnlocked && (
                    <span className="text-sm bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full text-xs font-medium">
                      Hidden
                    </span>
                  )}
                </h2>
                <p className="text-sm text-gray-500 mt-1 font-medium">
                  {isUnlocked 
                    ? "Ready to use! 🎉" 
                    : "Press & hold to reveal your code"}
                </p>
              </div>

              {/* TIMER */}
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border shadow-sm transition-all duration-500 ${
                isUnlocked 
                  ? "bg-green-50 text-green-600 border-green-200" 
                  : "bg-red-50 text-red-600 border-red-100"
              }`}>
                {isUnlocked ? (
                  <PartyPopper className="w-3.5 h-3.5" />
                ) : (
                  <Clock className="w-3.5 h-3.5" />
                )}
                <span className="font-mono text-xs font-bold">
                  {isUnlocked ? "UNLOCKED ✓" : formatTime(timeLeft)}
                </span>
              </div>
            </div>

            <div className="flex-1 flex flex-col justify-center space-y-6">
              <div className="bg-gray-50 rounded-xl p-4 border border-dashed border-gray-200">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs text-gray-400 font-bold uppercase">
                    Reference ID
                  </span>
                  <span className="text-xs font-mono text-gray-600">
                    {booking.huelineId}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-400 font-bold uppercase">
                    Status
                  </span>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-md ${
                    isUnlocked 
                      ? "text-green-700 bg-green-100" 
                      : "text-gray-500 bg-gray-100"
                  }`}>
                    {isUnlocked ? "Unlocked & Active" : "Awaiting Unlock"}
                  </span>
                </div>
              </div>

              {/* PRESS & HOLD TO REVEAL SECTION */}
              <div>
                <label className="text-xs font-bold text-gray-900 mb-2 block uppercase tracking-wide">
                  Promo Code
                </label>
                
                {!isUnlocked ? (
                  // Locked state - press and hold to reveal
                  <div className="relative">
                    <button
                      onMouseDown={startHold}
                      onMouseUp={cancelHold}
                      onMouseLeave={cancelHold}
                      onTouchStart={startHold}
                      onTouchEnd={cancelHold}
                      onTouchCancel={cancelHold}
                      className="w-full relative overflow-hidden group flex items-center justify-center p-4 bg-gradient-to-r from-gray-900 to-gray-800 rounded-xl transition-all active:scale-[0.99] cursor-pointer"
                      style={{ touchAction: 'none' }}
                    >
                      {/* Progress bar overlay */}
                      <div 
                        className="absolute left-0 top-0 h-full bg-gradient-to-r from-green-500 to-emerald-500 transition-all duration-100"
                        style={{ width: `${holdProgress}%`, opacity: 0.3 }}
                      />
                      
                      <div className="relative z-10 flex flex-col items-center gap-2">
                        {isHolding ? (
                          <>
                            <Fingerprint className="w-6 h-6 text-white animate-pulse" />
                            <span className="text-white font-semibold text-sm">
                              Hold for {Math.ceil((HOLD_DURATION * 100 - holdProgress * HOLD_DURATION) / 100)}s more...
                            </span>
                            <span className="text-white/60 text-xs">
                              {Math.floor(holdProgress)}% unlocked
                            </span>
                          </>
                        ) : (
                          <>
                            <Lock className="w-6 h-6 text-white/70 group-hover:text-white transition-colors" />
                            <span className="text-white font-medium text-sm">
                              Press & Hold to Reveal Code
                            </span>
                            <span className="text-white/50 text-xs">
                              {HOLD_DURATION} second hold to unlock
                            </span>
                          </>
                        )}
                      </div>
                    </button>
                  </div>
                ) : (
                  // Unlocked state - show code with copy button
                  <button
                    onClick={handleCopy}
                    className="w-full group flex items-center justify-between p-3 bg-white border-2 border-green-200 rounded-xl hover:border-green-300 transition-all active:scale-[0.99] shadow-sm"
                  >
                    <span className="font-mono text-xl font-bold text-gray-800 tracking-widest pl-2">
                      {PROMO_CODE}
                    </span>
                    <div className="h-8 w-8 flex items-center justify-center rounded-lg bg-green-50 text-green-600 group-hover:bg-green-100 transition-colors">
                      {copied ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </div>
                  </button>
                )}
              </div>
            </div>

            <div className="mt-8 pt-4">
              <Button 
                className="w-full h-12 rounded-xl font-semibold bg-gray-900 hover:bg-gray-800 text-white transition-all hover:shadow-xl"
                onClick={() => {
                  if (isUnlocked) {
                    handleCopy();
                  } else {
                    toast.info("Unlock first", {
                      description: "Press and hold the button above to reveal your code",
                      duration: 3000,
                    });
                  }
                }}
              >
                {isUnlocked ? (
                  <>Copy & Continue <ArrowRight className="w-4 h-4 ml-2" /></>
                ) : (
                  <>Unlock to Continue <Lock className="w-4 h-4 ml-2" /></>
                )}
              </Button>
              <p className="text-[10px] text-center text-gray-400 mt-3 font-medium">
                {isUnlocked 
                  ? "✓ Code unlocked - valid for this booking" 
                  : "Press and hold the button above for 5 seconds to unlock"}
              </p>
            </div>
          </div>
        </Card>

        {/* --- RIGHT: THE QUOTE (Invoice Style) --- */}
        <QuoteSurvey booking={booking} />
      </div>
    </section>
  );
};