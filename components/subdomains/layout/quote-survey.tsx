"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import {
  Sparkles,
  Lock,
  ScanFace,
  CheckCircle2,
  ArrowRight,
  Smartphone,
  Send,
  Loader2,
  FileText,
  Eye,
  ScanLine
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { BookingData } from "@/types/subdomain-type";
import { useBooking } from "@/context/booking-context";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

interface QuoteSurveyProps {
  booking: BookingData;
}

export const QuoteSurvey = ({ booking }: QuoteSurveyProps) => {
  const [showDialog, setShowDialog] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isSendingSMS, setIsSendingSMS] = useState(false);
  const [sendToMobile, setSendToMobile] = useState(false);
  
  const router = useRouter();
  const { subdomain } = useBooking();

  // --- LOGIC: Find the specific Self-Serve Room ---
  const selfServeRoom = useMemo(() => {
    if (!booking.rooms || booking.rooms.length === 0) return null;
    const selfServeRooms = booking.rooms.filter(
      (r) => r.sessionType === "SELF_SERVE"
    );
    if (selfServeRooms.length === 0) return null;
    return selfServeRooms.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )[0];
  }, [booking.rooms]);

  // --- HANDLER: Start New Survey ---
  const handleStartSurvey = async () => {
    if (isCreating) return;

    try {
      setIsCreating(true);
      const today = new Date();
      const dateStr = `${String(today.getMonth() + 1).padStart(2, "0")}${String(
        today.getDate()
      ).padStart(2, "0")}${today.getFullYear()}`;
      const slug = booking.name.toLowerCase().replace(/\s+/g, "");
      const roomKey = `${slug}-survey-${dateStr}-${Math.random()
        .toString(36)
        .substring(2, 6)}`;

      const response = await axios.post(
        `/api/subdomain/${subdomain.slug}/room/${roomKey}`,
        {
          bookingId: booking.id,
          roomName: `AI Property Survey - ${booking.name}`,
          clientName: booking.name,
          clientPhone: booking.phone,
          sessionType: "SELF_SERVE",
        }
      );

      if (response.data) {
        router.push(`/booking/${booking.huelineId}/${roomKey}`);
      }
    } catch (error) {
      console.error("Error creating survey room:", error);
      setIsCreating(false);
      toast.error("Failed to start survey. Please try again.");
    }
  };

  const handleViewResults = () => {
    if (selfServeRoom && selfServeRoom.roomKey) {
      router.push(`/booking/${booking.huelineId}/${selfServeRoom.roomKey}/post-session`);
    } else {
      toast.error("Survey data not found.");
    }
  };

  const handleSendSMS = async () => {
    if (isSendingSMS) return;
    try {
      setIsSendingSMS(true);
      await axios.post(
        `/api/subdomain/${subdomain.slug}/booking/${booking.huelineId}/send-self-serve-sms`
      );
      toast.success("Survey link sent to your mobile device!");
      setShowDialog(false);
    } catch (error) {
      console.error("Error sending SMS:", error);
      toast.error("Failed to send SMS. Please try again.");
    } finally {
      setIsSendingSMS(false);
    }
  };

  const isCompleted = booking.selfServeCompletion && selfServeRoom;

  return (
    <>
      <Card className="relative overflow-hidden border-0 bg-white shadow-xl shadow-blue-900/10 rounded-3xl flex flex-col h-full transform transition-all hover:translate-y-[-2px]">
        {/* Top Accent Bar (matches coupon card implied structure) */}
        
        <div className="p-6 md:p-8 flex-1 flex flex-col">
          
          {/* --- HEADER SECTION --- */}
          <div className="flex justify-between items-start mb-6">
            <div>
              <p className="text-xs font-bold tracking-widest text-gray-400 uppercase mb-1">
                AI Property Scan
              </p>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight">
                {isCompleted ? "Analysis Ready" : "Start Survey"}
              </h2>
              <p className="text-sm text-gray-500 mt-1 font-medium">
                {isCompleted ? "Scope & Snapshots captured" : "Video guided walkthrough"}
              </p>
            </div>
            
            {/* Status Badge */}
            {isCompleted ? (
              <div className="flex items-center gap-2 bg-green-50 text-green-700 px-3 py-1.5 rounded-full border border-green-100 shadow-sm">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span className="font-mono text-xs font-bold uppercase">Done</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full border border-blue-100 shadow-sm">
                <ScanLine className="w-3.5 h-3.5" />
                <span className="font-mono text-xs font-bold uppercase">Pending</span>
              </div>
            )}
          </div>

          {/* --- MIDDLE SECTION (CONTENT) --- */}
          <div className="flex-1 flex flex-col justify-center space-y-6">
            
            {isCompleted ? (
              /* COMPLETED STATE VISUAL */
              <div className="bg-gray-50 rounded-xl p-6 border border-dashed border-gray-200 flex flex-col items-center justify-center text-center space-y-3">
                 <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm border border-gray-100">
                    <FileText className="w-6 h-6 text-green-600" />
                 </div>
                 <div>
                   <h4 className="font-bold text-gray-900">Data Processed</h4>
                   <p className="text-xs text-gray-500">Your measurements are locked in.</p>
                 </div>
              </div>
            ) : (
              /* PENDING STATE VISUAL (LOCKED INVOICE LOOK) */
              <div 
                onClick={() => setShowDialog(true)}
                className="bg-gray-50 rounded-xl p-4 border border-dashed border-gray-200 relative overflow-hidden group cursor-pointer"
              >
                 {/* Blurred "Fake" Invoice Data */}
                 <div className="filter blur-[3px] opacity-50 grayscale transition-all duration-300 group-hover:blur-[2px]">
                    <div className="flex justify-between items-center mb-4">
                       <div className="h-3 w-24 bg-gray-300 rounded" />
                       <div className="h-3 w-12 bg-gray-300 rounded" />
                    </div>
                    <div className="space-y-2 mb-4">
                       <div className="h-2 w-full bg-gray-200 rounded" />
                       <div className="h-2 w-3/4 bg-gray-200 rounded" />
                    </div>
                    <div className="flex justify-between items-end border-t border-gray-200 pt-2">
                       <div className="h-3 w-16 bg-gray-300 rounded" />
                       <div className="h-6 w-20 bg-gray-400 rounded" />
                    </div>
                 </div>

                 {/* Lock Overlay */}
                 <div className="absolute inset-0 z-10 flex items-center justify-center">
                    <div className="bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg border border-gray-100 flex items-center gap-2 transform group-hover:scale-105 transition-all">
                       <Lock className="w-3 h-3 text-blue-600" />
                       <span className="text-xs font-bold text-gray-900">Get Quote Faster</span>
                    </div>
                 </div>
              </div>
            )}
            
            {/* Info Text Area (Matches the 'Promo Code' label area in neighbor) */}
            <div>
               <label className="text-xs font-bold text-gray-900 mb-2 block uppercase tracking-wide">
                 {isCompleted ? "Next Step" : "Requirement"}
               </label>
               <div className="w-full p-3 bg-white border-2 border-gray-100 rounded-xl flex items-center gap-3 text-gray-600">
                  {isCompleted ? (
                    <>
                      <Eye className="w-4 h-4 text-gray-400" />
                      <span className="text-sm font-medium">Review AI Findings</span>
                    </>
                  ) : (
                    <>
                      <Smartphone className="w-4 h-4 text-gray-400" />
                      <span className="text-sm font-medium">Mobile Camera Access</span>
                    </>
                  )}
               </div>
            </div>

          </div>

          {/* --- FOOTER SECTION (BUTTONS) --- */}
          <div className="mt-8 pt-4">
             {isCompleted ? (
                <Button 
                  onClick={handleViewResults}
                  className="w-full h-12 bg-gray-900 hover:bg-gray-800 text-white rounded-xl font-semibold shadow-lg shadow-gray-200 transition-all hover:shadow-xl group"
                >
                  View Session Results <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
             ) : (
                <Button
                  onClick={() => setShowDialog(true)}
                  disabled={isCreating}
                  className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold shadow-lg shadow-blue-200 transition-all hover:shadow-xl group"
                >
                  Begin AI Survey <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
             )}
             
            <p className="text-[10px] text-center text-gray-400 mt-3 font-medium">
              {isCompleted 
                ? "Generated by HueLine AI" 
                : "Takes approx 3 mins. No payment required."
              }
            </p>
          </div>
        </div>
      </Card>

      {/* --- DIALOG (UNCHANGED LOGIC, JUST STYLING TWEAKS) --- */}
      {showDialog && (
        <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="px-6 md:px-8 pt-6 md:pt-10 pb-6 md:pb-8 text-center">
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <ScanFace size={24} />
              </div>
              
              <h3 className="text-xl font-bold text-slate-900 mb-2">
                Let&apos;s take a quick look
              </h3>

              <p className="text-sm text-slate-500 mb-5 leading-relaxed text-balance">
                Take a short guided video walkthrough. Voice commands capture
                snapshots as you go so we can quickly define your project.
              </p>

              <div className="bg-slate-50 rounded-xl p-4 mb-5 text-left border border-slate-100">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Quick checklist
                </h4>

                <ul className="space-y-2 mb-4">
                  {[
                    "Lights turned on",
                    "Access to all rooms",
                    "Camera enabled",
                  ].map((item, i) => (
                    <li
                      key={i}
                      className="flex items-center gap-3 text-sm text-slate-700 font-medium"
                    >
                      <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                        <CheckCircle2 size={12} className="text-green-600" />
                      </div>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              {/* SEND TO MOBILE TOGGLE */}
              <div className="flex items-center justify-between bg-white border border-slate-200 rounded-xl p-3 mb-5 shadow-sm">
                <div className="flex items-center gap-2.5">
                  <div className="bg-slate-50 p-1.5 rounded-lg text-slate-600">
                    <Smartphone size={16} />
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-semibold text-slate-800">
                      Use your phone
                    </p>
                    <p className="text-[10px] text-slate-500">
                      Easier to move around
                    </p>
                  </div>
                </div>

                <Switch
                  checked={sendToMobile}
                  onCheckedChange={setSendToMobile}
                  className="data-[state=checked]:bg-blue-600"
                />
              </div>

              <div className="flex gap-3 w-full">
                <button
                  onClick={() => setShowDialog(false)}
                  disabled={isCreating || isSendingSMS}
                  className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-600 font-bold text-sm hover:bg-slate-50 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  onClick={sendToMobile ? handleSendSMS : handleStartSurvey}
                  disabled={isCreating || isSendingSMS}
                  className={`flex-1 py-3 rounded-xl text-white font-bold text-sm transition-colors shadow-lg disabled:opacity-50 flex items-center justify-center gap-2 ${
                    sendToMobile
                      ? "bg-slate-900 hover:bg-slate-800 shadow-slate-200"
                      : "bg-blue-600 hover:bg-blue-700 shadow-blue-200"
                  }`}
                >
                  {isCreating || isSendingSMS ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      {isCreating ? "Connecting..." : "Sending..."}
                    </>
                  ) : sendToMobile ? (
                    <>
                      Send Link <Send size={16} />
                    </>
                  ) : (
                    "I'm Ready"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};