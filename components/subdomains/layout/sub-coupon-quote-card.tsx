"use client";

import { useState, useEffect } from "react";
import { 
  Clock, 
  Copy, 
  Check, 
  ArrowRight, 
  Sparkles, 
  Palette,
  Send
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { BookingData } from "@/types/subdomain-type";

export const SubCouponQuoteCards = ({ booking }: { booking: BookingData }) => {
  const [timeLeft, setTimeLeft] = useState(72 * 60 * 60);
  const [copied, setCopied] = useState(false);

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
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleCopy = () => {
    navigator.clipboard.writeText("SAVE15NOW");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section className="w-full max-w-5xl mx-auto py-12 px-1 md:px-0">
      
      {/* --- 1. SECTION HEADER --- */}
      {/* This grounds the cards so they don't feel like they are floating aimlessly */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
        <div> 
          <h1 className="text-xs font-bold  uppercase tracking-widest">AUTOMATED QUOTE & OFFER</h1>
          <h2 className="text-2xl md:text-4xl font-bold text-black">
            Generated Client <span className="text-primary">Assets</span>
          </h2>
       
        </div>

       
      </div>

      {/* --- 2. THE GRID --- */}
      <div className="grid md:grid-cols-2 gap-6 lg:gap-8">
        
        {/* --- LEFT: THE OFFER (Ticket Style) --- */}
        <Card className="relative overflow-hidden border-0 bg-white shadow-xl shadow-blue-900/10 rounded-3xl flex flex-col h-full transform transition-all hover:translate-y-[-2px]">
          {/* Top Accent Bar */}
   
          <div className="p-6 md:p-8 flex-1 flex flex-col">
            <div className="flex justify-between items-start mb-6">
              <div>
                <p className="text-xs font-bold tracking-widest text-gray-400 uppercase mb-1">Exclusive Offer</p>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight">15% Off</h2>
                <p className="text-sm text-gray-500 mt-1 font-medium">First-time client discount</p>
              </div>
              
              <div className="flex items-center gap-2 bg-red-50 text-red-600 px-3 py-1.5 rounded-full border border-red-100 shadow-sm">
                <Clock className="w-3.5 h-3.5" />
                <span className="font-mono text-xs font-bold">{formatTime(timeLeft)}</span>
              </div>
            </div>

            <div className="flex-1 flex flex-col justify-center space-y-6">
              <div className="bg-gray-50 rounded-xl p-4 border border-dashed border-gray-200">
                 <div className="flex justify-between items-center mb-2">
                   <span className="text-xs text-gray-400 font-bold uppercase">Reference ID</span>
                   <span className="text-xs font-mono text-gray-600">{booking.huelineId}</span>
                 </div>
                 <div className="flex justify-between items-center">
                   <span className="text-xs text-gray-400 font-bold uppercase">Status</span>
                   <span className="text-xs font-bold text-green-700 bg-green-100 px-2 py-0.5 rounded-md">Active</span>
                 </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-900 mb-2 block uppercase tracking-wide">Promo Code</label>
                <button 
                  onClick={handleCopy}
                  className="w-full group flex items-center justify-between p-3 bg-white border-2 border-gray-100 rounded-xl hover:border-gray-300 transition-all active:scale-[0.99]"
                >
                  <span className="font-mono text-xl font-bold text-gray-800 tracking-widest pl-2">SAVE15NOW</span>
                  <div className="h-8 w-8 flex items-center justify-center rounded-lg bg-gray-50 text-gray-400 group-hover:text-gray-900 group-hover:bg-gray-200 transition-colors">
                    {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                  </div>
                </button>
              </div>
            </div>

            <div className="mt-8 pt-4">
              <Button className="w-full h-12 bg-gray-900 hover:bg-gray-800 text-white rounded-xl font-semibold shadow-lg shadow-gray-200 transition-all hover:shadow-xl">
                Claim Offer <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              <p className="text-[10px] text-center text-gray-400 mt-3 font-medium">
                Valid for residential projects over 500 sq ft.
              </p>
            </div>
          </div>
        </Card>

        {/* --- RIGHT: THE QUOTE (Invoice Style) --- */}
        <Card className="relative overflow-hidden border-0 bg-white shadow-xl shadow-blue-900/10 rounded-3xl flex flex-col h-full transform transition-all hover:translate-y-[-2px]">
       

          <div className="p-6 md:p-8 flex-1 flex flex-col">
            <div className="flex items-center gap-4 mb-6">
           
              <div>
                <h3 className="text-xs font-bold tracking-widest text-gray-400 uppercase mb-1">Estimate Preview</h3>
                <p className="text-sm text-gray-500 mt-1 font-medium">Prepared for {booking.name}</p>
              </div>
            </div>

            <Separator className="mb-6 bg-gray-100" />

            <div className="mb-8">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 block">Selected Palette</span>
              <div className="flex flex-wrap gap-4">
                {(booking.paintColors && booking.paintColors.length > 0) ? (
                  booking.paintColors.map((color) => (
                    <div key={color.id} className="group flex flex-col items-center gap-2">
                      <div 
                        className="w-12 h-12 rounded-full border-4 border-white shadow-md ring-1 ring-gray-100 transition-transform group-hover:scale-110" 
                        style={{ backgroundColor: color.hex }}
                      />
                      <span className="text-[10px] font-semibold text-gray-600 max-w-[60px] text-center  px-1 py-0.5 bg-gray-50 rounded-md">
                        {color.name}
                      </span>
                    </div>
                  ))
                ) : (
                  <>
                     <div className="flex flex-col items-center gap-2 opacity-60">
                        <div className="w-10 h-10 rounded-full bg-[#1e293b] border-2 border-white shadow-sm" />
                        <span className="text-[10px] text-gray-500">Navy</span>
                     </div>
                     <div className="flex flex-col items-center gap-2 opacity-60">
                        <div className="w-10 h-10 rounded-full bg-[#f1f5f9] border-2 border-gray-100 shadow-sm" />
                        <span className="text-[10px] text-gray-500">White</span>
                     </div>
                  </>
                )}
              </div>
            </div>

            {/* Line Items */}
            <div className="space-y-4 flex-1">
               <div className="flex justify-between items-baseline text-sm p-3 hover:bg-gray-50 rounded-lg transition-colors border border-transparent hover:border-gray-100">
                  <span className="text-gray-600 font-medium">Surface Prep & Repairs</span>
                  <span className="font-mono font-semibold text-gray-900">$350.00</span>
               </div>
               <div className="flex justify-between items-baseline text-sm p-3 hover:bg-gray-50 rounded-lg transition-colors border border-transparent hover:border-gray-100">
                  <span className="text-gray-600 font-medium">Premium Materials</span>
                  <span className="font-mono font-semibold text-gray-900">$425.00</span>
               </div>
               <div className="flex justify-between items-baseline text-sm p-3 hover:bg-gray-50 rounded-lg transition-colors border border-transparent hover:border-gray-100">
                  <span className="text-gray-600 font-medium">Labor & Application</span>
                  <span className="font-mono font-semibold text-gray-900">$650.00</span>
               </div>
               
               <div className="pt-4 mt-2 border-t border-gray-100 px-3">
                  <div className="flex justify-between items-baseline">
                     <span className="text-base font-bold text-gray-900">Estimated Total</span>
                     <span className="font-mono text-2xl font-bold text-gray-900">$1,425.00</span>
                  </div>
               </div>
            </div>
            
            <div className="mt-8 bg-gray-50 rounded-xl p-3 border border-gray-100 text-center">
               <p className="text-[10px] text-gray-400 font-medium">
                  This is a mock-up of what {booking.name} receives automatically.
               </p>
            </div>
          </div>
        </Card>
      </div>
    </section>
  );
};