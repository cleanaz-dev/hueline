"use client";

import { useState, useEffect } from "react";
import {
  Clock,
  Copy,
  Check,
  ArrowRight,
  Sparkles,
  Gift,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { BookingData } from "@/types/subdomain-type";
import { QuoteSurvey } from "./quote-survey";

export const SubCouponQuoteCards = ({ booking }: { booking: BookingData }) => {
  const [timeLeft, setTimeLeft] = useState(72 * 60 * 60);
  const [copied, setCopied] = useState(false);
  const [offerClaimed, setOfferClaimed] = useState(false);
  const [buttonText, setButtonText] = useState("Claim Offer");
  const [discountText, setDiscountText] = useState("15% Off");
  const [promoCode, setPromoCode] = useState("SAVE15NOW");

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(promoCode);
    setCopied(true);
    toast.success("Promo code copied!", {
      description: "Use SAVE15NOW at checkout",
      duration: 2000,
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClaimOffer = () => {
    if (!offerClaimed) {
      // Change the text and state
      setOfferClaimed(true);
      setButtonText("Offer Claimed! 🎉");
      setDiscountText("Welcome Gift Unlocked!");
      setPromoCode("WELCOME15");
      
      // Show success toast with Sonner
      toast.success("Offer claimed successfully!", {
        description: "Your 15% discount has been applied to this booking",
        duration: 4000,
        icon: <Gift className="w-4 h-4" />,
      });
      
      // Optional: Show a second toast with next steps
      setTimeout(() => {
        toast("Next steps:", {
          description: "Use code WELCOME15 at checkout or share your project details",
          duration: 5000,
          action: {
            label: "Got it",
            onClick: () => console.log("Dismissed"),
          },
        });
      }, 1000);
      
      // Reset button text after 3 seconds (optional)
      setTimeout(() => {
        if (offerClaimed) {
          setButtonText("✓ Offer Applied");
        }
      }, 3000);
    } else {
      // If already claimed, show info toast
      toast.info("Offer already claimed", {
        description: `Your discount code ${promoCode} is ready to use`,
        duration: 2000,
      });
    }
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
          {/* Optional: Add a subtle animation when offer is claimed */}
          {offerClaimed && (
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-green-400 to-emerald-500 rounded-bl-3xl opacity-10" />
          )}
          
          <div className="p-6 md:p-8 flex-1 flex flex-col">
            <div className="flex justify-between items-start mb-6">
              <div>
                <p className="text-xs font-bold tracking-widest text-gray-400 uppercase mb-1">
                  {offerClaimed ? "✓ Claimed" : "Exclusive Offer"}
                </p>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
                  {discountText}
                  {offerClaimed && <Sparkles className="w-6 h-6 text-yellow-500" />}
                </h2>
                <p className="text-sm text-gray-500 mt-1 font-medium">
                  {offerClaimed 
                    ? "Welcome to the family! 🎉" 
                    : "First-time client discount"}
                </p>
              </div>

              <div className="flex items-center gap-2 bg-red-50 text-red-600 px-3 py-1.5 rounded-full border border-red-100 shadow-sm">
                <Clock className="w-3.5 h-3.5" />
                <span className="font-mono text-xs font-bold">
                  {formatTime(timeLeft)}
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
                    offerClaimed 
                      ? "text-green-700 bg-green-100" 
                      : "text-yellow-700 bg-yellow-100"
                  }`}>
                    {offerClaimed ? "Claimed & Active" : "Ready to Claim"}
                  </span>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-900 mb-2 block uppercase tracking-wide">
                  Promo Code
                </label>
                <button
                  onClick={handleCopy}
                  className="w-full group flex items-center justify-between p-3 bg-white border-2 border-gray-100 rounded-xl hover:border-gray-300 transition-all active:scale-[0.99]"
                >
                  <span className="font-mono text-xl font-bold text-gray-800 tracking-widest pl-2">
                    {promoCode}
                  </span>
                  <div className="h-8 w-8 flex items-center justify-center rounded-lg bg-gray-50 text-gray-400 group-hover:text-gray-900 group-hover:bg-gray-200 transition-colors">
                    {copied ? (
                      <Check className="w-4 h-4 text-green-600" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </div>
                </button>
              </div>
            </div>

            <div className="mt-8 pt-4">
              <Button 
                onClick={handleClaimOffer}
                className={`w-full h-12 rounded-xl font-semibold transition-all hover:shadow-xl ${
                  offerClaimed
                    ? "bg-green-600 hover:bg-green-700 text-white"
                    : "bg-gray-900 hover:bg-gray-800 text-white"
                }`}
                disabled={offerClaimed}
              >
                {buttonText} 
                {!offerClaimed && <ArrowRight className="w-4 h-4 ml-2" />}
              </Button>
              <p className="text-[10px] text-center text-gray-400 mt-3 font-medium">
                {offerClaimed 
                  ? "✓ Discount applied to your booking" 
                  : "Valid for residential projects over 500 sq ft."}
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