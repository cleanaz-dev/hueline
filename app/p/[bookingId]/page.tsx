"use client";

import { useState, useEffect, useCallback } from "react";
import { signIn, useSession } from "next-auth/react";
import { Loader2, Lock, ArrowRight } from "lucide-react";
import { toast } from "sonner"; 
import { useRouter } from "next/navigation";

interface Props {
  params: { huelineId: string };
}

export default function PortalEntryPage({ params }: Props) {
  const huelineId = params.huelineId;
  const { data: session, status, update } = useSession(); // Import update
  const router = useRouter();
  
  const [pin, setPin] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);

  // --- 1. REDIRECT LOGIC ---
  const handleRedirect = useCallback((slug: string, id: string) => {
    setIsRedirecting(true);
    const protocol = window.location.protocol;
    const host = window.location.host;
    const cleanPath = `/booking/${id}`; 

    let targetUrl = "";
    
    // Determine target domain
    if (host.includes("localhost")) {
      targetUrl = `${protocol}//${slug}.localhost:3000${cleanPath}`;
    } else {
      const rootDomain = "hue-line.com"; // Change this if your domain differs
      targetUrl = `${protocol}//${slug}.${rootDomain}${cleanPath}`;
    }

    console.log("🚀 Redirecting to:", targetUrl);
    window.location.href = targetUrl;
  }, []);

  // --- 2. AUTO-REDIRECT IF ALREADY LOGGED IN ---
  useEffect(() => {
    // Only run if we are fully authenticated and have data
    if (status === "authenticated" && session?.user && huelineId) {
      const userHuelineId = session.user.huelineId || "";
      
      if (userHuelineId.toLowerCase() === huelineId.toLowerCase()) {
        const slug = session.user.subdomainSlug || "app";
        handleRedirect(slug, huelineId);
      }
    }
  }, [status, session, huelineId, handleRedirect]);

  // --- 3. LOGIN ACTION ---
  const performLogin = async (pinValue: string) => {
    if (!huelineId) {
      toast.error("Missing Project ID");
      return;
    }

    setIsSubmitting(true);

    try {
      // A. Authenticate
      const result = await signIn("booking-portal", {
        huelineId,
        pin: pinValue,
        redirect: false,
      });

      if (result?.error) {
        toast.error("Incorrect PIN");
        setPin(""); 
        setIsSubmitting(false);
        return;
      }

      // B. Force Session Update (This fixes the race condition)
      // We await the update so the session object is hydrated before we check it
      const newSession = await update();

      // C. Check & Redirect
      if (newSession?.user?.subdomainSlug) {
        toast.success("Access Granted");
        handleRedirect(newSession.user.subdomainSlug, huelineId);
      } else {
        // Fallback: Reload page to force server-side session check if client update failed
        console.log("Session update lagging, forcing reload...");
        window.location.reload(); 
      }

    } catch (error) {
      console.error("Critical Login Error:", error);
      toast.error("Connection failed. Please try again.");
      setIsSubmitting(false);
    }
  };

  // --- 4. INPUT HANDLER ---
  const handlePinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    
    // Numbers only
    if (!/^\d*$/.test(val)) return;

    setPin(val);

    // Trigger login immediately on 4th digit
    if (val.length === 4) {
      performLogin(val);
    }
  };

  // --- 5. LOADING STATES ---
  if (status === "loading" || isRedirecting) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <Loader2 className="w-10 h-10 text-gray-900 animate-spin mb-4" />
        <p className="text-gray-500 font-medium animate-pulse">
          {isRedirecting ? "Redirecting to project..." : "Verifying access..."}
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="bg-white max-w-sm w-full rounded-2xl shadow-xl border border-gray-100 ring-1 ring-gray-900/5 overflow-hidden">
        <div className="bg-gray-50/80 p-8 text-center border-b border-gray-100">
          <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm border border-gray-100 text-gray-900">
            <Lock className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-bold text-gray-900">Private Project</h1>
          <p className="text-sm text-gray-500 mt-2 font-mono bg-gray-100 inline-block px-2 py-1 rounded">
            ID: {huelineId}
          </p>
        </div>

        <div className="p-8">
          <form onSubmit={(e) => { e.preventDefault(); if(pin.length===4) performLogin(pin); }} className="space-y-6">
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
                className="w-full text-center text-4xl font-mono tracking-[0.5em] py-4 border-2 border-gray-100 rounded-xl focus:border-gray-900 focus:ring-0 outline-none transition-all placeholder:text-gray-200 text-gray-900"
                placeholder="••••"
                autoFocus
              />
            </div>
            
            <button
              type="submit"
              disabled={isSubmitting || pin.length < 4}
              className="w-full bg-gray-900 text-white py-4 rounded-xl font-semibold hover:bg-black disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
            >
              {isSubmitting ? <Loader2 className="animate-spin w-5 h-5" /> : <>Access Project <ArrowRight className="w-4 h-4" /></>}
            </button>
          </form>
          <p className="text-center text-xs text-gray-400 mt-6">
            Secure access provided by Hue-Line
          </p>
        </div>
      </div>
    </div>
  );
}