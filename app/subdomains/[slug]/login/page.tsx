// app/subdomains/[slug]/login/page.tsx
"use client";

import { useState, useEffect, Suspense } from "react";
import { signIn, useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { Loader2, Lock, ArrowRight } from "lucide-react";
import { toast } from "sonner"; 

export default function SubdomainLoginPage() {
  return (
    <Suspense fallback={<div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin" /></div>}>
      <PinEntryForm />
    </Suspense>
  );
}

function PinEntryForm() {
  const searchParams = useSearchParams();
  const huelineId = searchParams.get("huelineId"); // Passed from Booking Page
  const { data: session, status, update } = useSession();
  
  const [pin, setPin] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 1. AUTO REDIRECT (If already logged in)
  useEffect(() => {
    if (status === "authenticated" && session?.user && huelineId) {
      if (session.user.huelineId?.toLowerCase() === huelineId.toLowerCase()) {
        // Redirect to booking page on THIS subdomain
        window.location.href = `/booking/${huelineId}`;
      }
    }
  }, [status, session, huelineId]);

  // 2. SUBMIT LOGIC
  const handlePinSubmit = async (pinValue: string) => {
    if (!huelineId) {
        toast.error("Project ID missing");
        return;
    }
    setIsSubmitting(true);

    try {
      const result = await signIn("booking-portal", {
        huelineId: huelineId.toLowerCase(),
        pin: pinValue,
        redirect: false,
      });

      if (result?.error) {
        toast.error("Incorrect PIN");
        setPin(""); 
        setIsSubmitting(false);
        return;
      }

      await update();
      // SUCCESS: Go to Booking Page
      window.location.href = `/booking/${huelineId}`;

    } catch (error) {
      console.error(error);
      toast.error("Login failed");
      setIsSubmitting(false);
    }
  };

  // 3. INPUT HANDLER (Auto-Submit)
  const handlePinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (!/^\d*$/.test(val)) return;
    setPin(val);
    if (val.length === 4) handlePinSubmit(val);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="bg-white max-w-sm w-full rounded-2xl shadow-xl border border-gray-100 p-8">
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-gray-100 text-gray-900">
            <Lock className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-bold text-gray-900">Private Project</h1>
          {huelineId && (
            <p className="text-sm text-gray-500 mt-2 font-mono bg-gray-100 inline-block px-2 py-1 rounded">
              ID: {huelineId}
            </p>
          )}
        </div>

        <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
          <div className="space-y-2">
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest text-center">
              Enter 4-Digit PIN
            </label>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={4}
              value={pin}
              onChange={handlePinChange}
              disabled={isSubmitting}
              className="w-full text-center text-4xl font-mono tracking-[0.5em] py-4 border-2 border-gray-100 rounded-xl focus:border-gray-900 outline-none transition-all placeholder:text-gray-200 text-gray-900"
              placeholder="••••"
              autoFocus
            />
          </div>
          
          <button disabled className="w-full py-4 text-sm text-gray-400 flex justify-center">
            {isSubmitting ? <Loader2 className="animate-spin w-5 h-5" /> : "Auto-verifying..."}
          </button>
        </form>
      </div>
    </div>
  );
}