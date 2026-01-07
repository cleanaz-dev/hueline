"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import {
  Sparkles,
  Lock,
  ChevronRight,
  ScanFace,
  CheckCircle2,
  ArrowRight,
  Smartphone,
  Send,
  Loader2,
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
  const [sendToMobile, setSendToMobile] = useState(false); // Toggle State
  const router = useRouter();
  const { subdomain } = useBooking();

  // --- HANDLER: Start Survey Immediately ---
  const handleStartSurvey = async () => {
    if (isCreating) return;

    try {
      setIsCreating(true);

      const today = new Date();
      const dateStr = `${String(today.getMonth() + 1).padStart(2, "0")}${String(
        today.getDate()
      ).padStart(2, "0")}${today.getFullYear()}`;
      const slug = booking.name.toLowerCase().replace(/\s+/g, "");
      const roomId = `${slug}-survey-${dateStr}-${Math.random()
        .toString(36)
        .substring(2, 6)}`;

      const response = await axios.post(
        `/api/subdomain/${subdomain.slug}/room/${roomId}`,
        {
          bookingId: booking.id,
          roomName: `AI Property Survey - ${booking.name}`,
          clientName: booking.name,
          clientPhone: booking.phone,
          sessionType: "SELF_SERVE",
        }
      );

      if (response.data) {
        router.push(`/booking/${booking.huelineId}/${roomId}`);
      }
    } catch (error) {
      console.error("Error creating survey room:", error);
      setIsCreating(false);
      toast.error("Failed to start survey. Please try again.");
    }
  };

  // --- HANDLER: Send SMS Link ---
  const handleSendSMS = async () => {
    if (isSendingSMS) return;

    try {
      setIsSendingSMS(true);
      await axios.post(
        `/api/subdomain/${subdomain.slug}/booking/${booking.huelineId}/send-self-serve-sms`
      );
      toast.success("Survey link sent to your mobile device!");
      setShowDialog(false); // Close dialog on success
    } catch (error) {
      console.error("Error sending SMS:", error);
      toast.error("Failed to send SMS. Please try again.");
    } finally {
      setIsSendingSMS(false);
    }
  };

  return (
    <>
      <Card className="relative overflow-hidden border-0 bg-white shadow-xl shadow-blue-900/10 rounded-3xl flex flex-col h-full transform transition-all hover:translate-y-[-2px]">
        {/* BACKGROUND DECORATION */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50/50 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />

        {/* MAIN CONTAINER */}
        <div className="p-6 md:p-8 flex-1 flex flex-col relative z-10">
          {/* HEADER: AI PERSONA */}
          <div className="flex items-start gap-4 mb-6">
            <div className="relative">
              <div className="w-14 h-14 rounded-2xl overflow-hidden border-2 border-white shadow-lg ring-1 ring-slate-100">
                <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center text-white">
                  <ScanFace size={28} />
                </div>
              </div>
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 border-2 border-white rounded-full flex items-center justify-center">
                <Sparkles size={10} className="text-white fill-current" />
              </div>
            </div>
            <div className="flex-1 pt-1">
              <h3 className="text-lg font-bold text-slate-900 leading-tight">
                Hi, {booking.name.split(" ")[0]}.
              </h3>
              <p className="text-sm text-slate-500 mt-1 leading-snug">
                Ready for a quick pre-site survey?
              </p>
            </div>
          </div>

          {/* MIDDLE: LOCKED PRICING */}
          <div className="flex-1 flex flex-col justify-center space-y-6">
            <div
              className="bg-slate-50 rounded-2xl border border-slate-100 p-1 relative overflow-hidden group cursor-pointer h-full min-h-[140px]"
              onClick={() => setShowDialog(true)}
            >
              {/* Blurred Content */}
              <div className="p-5 filter blur-[6px] opacity-60 select-none grayscale-[50%] transition-all duration-500 group-hover:blur-[4px] h-full flex flex-col justify-center">
                <div className="flex justify-between items-center mb-4">
                  <div className="h-4 w-32 bg-slate-300 rounded" />
                  <div className="h-4 w-16 bg-slate-300 rounded" />
                </div>
                <div className="space-y-3 mb-6">
                  <div className="h-3 w-full bg-slate-200 rounded" />
                  <div className="h-3 w-3/4 bg-slate-200 rounded" />
                </div>
                <div className="flex justify-between items-end border-t border-slate-200 pt-4">
                  <div className="h-4 w-24 bg-slate-300 rounded" />
                  <div className="h-8 w-28 bg-slate-400 rounded" />
                </div>
              </div>

              {/* Overlay Lock with Updated Text */}
              <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-white/30 backdrop-blur-[2px] transition-colors group-hover:bg-white/10">
                <div className="bg-white p-3 rounded-full shadow-xl shadow-blue-900/10 mb-2 transform group-hover:scale-110 transition-transform duration-300">
                  <Lock className="w-5 h-5 text-blue-600" />
                </div>
                <div className="bg-slate-900 text-white px-3 py-1 rounded-full text-[10px] font-bold shadow-lg flex items-center gap-1">
                  Get your quote faster!
                </div>
              </div>
            </div>
          </div>

          {/* FOOTER: ACTION AREA */}
          <div className="mt-8 pt-4">
            <Button
              onClick={() => setShowDialog(true)}
              disabled={isCreating}
              className="w-full h-12 bg-green-500 hover:bg-gray-800 text-white rounded-xl font-semibold shadow-lg shadow-gray-200 transition-all hover:shadow-xl group"
            >
              Start Survey{" "}
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>

            <div className="flex items-center justify-center gap-4 mt-3 text-[10px] text-gray-400 font-medium">
              <span className="flex items-center gap-1">
                <CheckCircle2 size={12} className="text-green-500" /> No payment
                required
              </span>
              <span className="flex items-center gap-1">
                <CheckCircle2 size={12} className="text-green-500" /> Takes ~3
                mins
              </span>
            </div>
          </div>
        </div>
      </Card>

      {/* SURVEY DIALOG */}
{showDialog && (
  <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-300">
    <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-300">
      <div className="px-6 md:px-8 pt-6 md:pt-10 pb-6 md:pb-8 text-center">
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

          <div className="border-t border-slate-200 pt-3">
            <p className="text-xs text-slate-400 leading-relaxed">
              Avoid recording people, faces, personal items, or sensitive
              information.
            </p>
          </div>
        </div>

        {/* SEND TO MOBILE TOGGLE */}
        <div className="flex items-center justify-between bg-slate-50 border border-slate-100 rounded-xl p-3 mb-5">
          <div className="flex items-center gap-2.5">
            <div className="bg-white p-1.5 rounded-lg border border-slate-200 shadow-sm text-slate-600">
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
            className="data-[state=checked]:bg-indigo-600"
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
                : "bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200"
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
