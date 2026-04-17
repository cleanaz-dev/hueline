"use client";

import { useState, useEffect, useRef } from "react";
import {
  Clock,
  Copy,
  Check,
  ArrowRight,
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
  const[holdProgress, setHoldProgress] = useState(0);
  const [isHolding, setIsHolding] = useState(false);
  const holdTimerRef = useRef<NodeJS.Timeout | null>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  const PROMO_CODE = "WELCOME15"; 
  const HOLD_DURATION = 5; 

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  },[]);

  useEffect(() => {
    return () => {
      if (holdTimerRef.current) clearTimeout(holdTimerRef.current);
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    };
  },[]);

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
    
    progressIntervalRef.current = setInterval(() => {
      setHoldProgress((prev) => {
        const newProgress = prev + (100 / (HOLD_DURATION * 10)); 
        if (newProgress >= 100) {
          clearInterval(progressIntervalRef.current!);
          clearTimeout(holdTimerRef.current!);
          setIsUnlocked(true);
          setIsHolding(false);
          setHoldProgress(100);
          
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
      toast.error("Code Locked", {
        description: "Please press and hold the blue area to reveal your code.",
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
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
        <div>
          <h1 className="text-xs font-bold uppercase tracking-widest text-gray-500">
            AUTOMATED QUOTE & OFFER
          </h1>
          <h2 className="text-2xl md:text-4xl font-bold text-black mt-1">
            Generated Client <span className="text-blue-600">Assets</span>
          </h2>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6 lg:gap-8">
        {/* --- LEFT: THE OFFER --- */}
        <Card className="relative overflow-hidden border border-gray-200 bg-white shadow-xl shadow-blue-900/5 rounded-3xl flex flex-col h-full transform transition-all hover:-translate-y-1">
          {isUnlocked && (
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-400 to-emerald-500 rounded-bl-full opacity-10" />
          )}
          
          <div className="p-6 md:p-8 flex-1 flex flex-col">
            <div className="flex justify-between items-start mb-6">
              <div>
                <p className={`text-xs font-bold tracking-widest uppercase mb-1 ${isUnlocked ? 'text-green-600' : 'text-gray-400'}`}>
                  {isUnlocked ? "✓ Unlocked" : "🔒 Locked Offer"}
                </p>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
                  15% Off
                  {!isUnlocked && (
                    <span className="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded-full font-medium">
                      Hidden
                    </span>
                  )}
                </h2>
                <p className="text-sm text-gray-500 mt-2 font-medium">
                  {isUnlocked 
                    ? "Ready to use! 🎉" 
                    : "Unlock this offer to reveal your code"}
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

            <div className="flex-1 flex flex-col justify-center space-y-6 my-4">
              <div className="bg-gray-50 rounded-xl p-4 border border-dashed border-gray-200">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-xs text-gray-500 font-semibold uppercase tracking-wider">
                    Reference ID
                  </span>
                  <span className="text-xs font-mono font-medium text-gray-700 bg-white px-2 py-1 rounded border">
                    {booking.huelineId}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500 font-semibold uppercase tracking-wider">
                    Status
                  </span>
                  <span className={`text-xs font-bold px-2 py-1 rounded-md ${
                    isUnlocked 
                      ? "text-green-700 bg-green-100" 
                      : "text-amber-700 bg-amber-100"
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
                  // Locked state - Improved UI with distinct colors and clearer instructions
                  <div className="relative">
                    <button
                      onMouseDown={startHold}
                      onMouseUp={cancelHold}
                      onMouseLeave={cancelHold}
                      onTouchStart={startHold}
                      onTouchEnd={cancelHold}
                      onTouchCancel={cancelHold}
                      // Added select-none to prevent text highlighting while holding
                      // Changed background to blue/indigo gradient to distinct it from standard buttons
                      className={`w-full relative overflow-hidden select-none group flex items-center justify-center p-5 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl transition-all cursor-pointer shadow-md ${isHolding ? 'scale-[0.98]' : 'hover:scale-[1.01] hover:shadow-lg'}`}
                      style={{ touchAction: 'none' }}
                    >
                      {/* Bright, distinct progress bar overlay */}
                      <div 
                        className="absolute left-0 top-0 h-full bg-gradient-to-r from-emerald-400 to-green-500 transition-all duration-100 ease-linear"
                        style={{ width: `${holdProgress}%`, opacity: 0.85 }}
                      />
                      
                      <div className="relative z-10 flex flex-col items-center gap-1.5">
                        {isHolding ? (
                          <>
                            <Fingerprint className="w-7 h-7 text-white animate-pulse drop-shadow-md" />
                            <span className="text-white font-bold text-sm tracking-wide drop-shadow-md">
                              Keep holding... {Math.ceil((HOLD_DURATION * 100 - holdProgress * HOLD_DURATION) / 100)}s
                            </span>
                          </>
                        ) : (
                          <>
                            <Fingerprint className="w-7 h-7 text-white/90 group-hover:text-white transition-colors animate-pulse" />
                            <span className="text-white font-semibold text-sm tracking-wide">
                              Press & Hold to Reveal Code
                            </span>
                            <span className="text-white/70 text-xs font-medium">
                              Takes {HOLD_DURATION} seconds
                            </span>
                          </>
                        )}
                      </div>
                    </button>
                  </div>
                ) : (
                  // Unlocked state
                  <button
                    onClick={handleCopy}
                    className="w-full group flex items-center justify-between p-4 bg-white border-2 border-green-400 rounded-xl hover:bg-green-50 transition-all active:scale-[0.99] shadow-sm"
                  >
                    <span className="font-mono text-2xl font-black text-gray-800 tracking-widest pl-2">
                      {PROMO_CODE}
                    </span>
                    <div className={`h-10 w-10 flex items-center justify-center rounded-lg transition-colors ${copied ? 'bg-green-500 text-white' : 'bg-green-100 text-green-700'}`}>
                      {copied ? (
                        <Check className="w-5 h-5" />
                      ) : (
                        <Copy className="w-5 h-5" />
                      )}
                    </div>
                  </button>
                )}
              </div>
            </div>

            {/* BOTTOM BUTTON */}
            <div className="pt-2">
              <Button 
                // Style as disabled/inactive when locked so it doesn't look like a primary action
                className={`w-full h-12 rounded-xl font-semibold transition-all duration-300 ${
                  isUnlocked 
                    ? 'bg-gray-900 hover:bg-gray-800 text-white hover:shadow-xl shadow-md'
                    : 'bg-gray-100 text-gray-400 border border-gray-200 hover:bg-gray-100 shadow-none'
                }`}
                onClick={() => {
                  if (isUnlocked) {
                    handleCopy();
                  } else {
                    toast.info("Action Required", {
                      description: "Please press and hold the blue button to unlock your code.",
                      duration: 3000,
                    });
                  }
                }}
              >
                {isUnlocked ? (
                  <>Copy Code & Continue <ArrowRight className="w-4 h-4 ml-2" /></>
                ) : (
                  <>Awaiting Unlock... <Lock className="w-4 h-4 ml-2" /></>
                )}
              </Button>
            </div>
          </div>
        </Card>

        {/* --- RIGHT: THE QUOTE --- */}
        <QuoteSurvey booking={booking} />
      </div>
    </section>
  );
};