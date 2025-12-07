"use client";

import { useState, useEffect } from "react";
import { signIn, useSession } from "next-auth/react";
import { Loader2, Lock, ArrowRight } from "lucide-react";
import { toast } from "sonner"; 

// Next.js 15+ Params are Promises
interface Props {
  params: Promise<{ bookingId: string }>;
}

export default function PortalEntryPage({ params }: Props) {
  const [bookingId, setBookingId] = useState<string>("");
  const { data: session, status } = useSession();
  
  const [pin, setPin] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);

  // Unwrap params
  useEffect(() => {
    params.then((p) => setBookingId(p.bookingId));
  }, [params]);

  // --- REDIRECT HELPER ---
  const handleRedirect = (slug: string, id: string) => {
    setIsRedirecting(true);
    const protocol = window.location.protocol;
    const host = window.location.host;

    // We send them to '/j/' -> next.config.ts redirects to '/booking/'
    const cleanPath = `/j/${id}`; 

    let targetUrl = "";
    if (host.includes("localhost")) {
      targetUrl = `${protocol}//${slug}.localhost:3000${cleanPath}`;
    } else {
      const rootDomain = host.split('.').slice(-2).join('.');
      targetUrl = `${protocol}//${slug}.${rootDomain}${cleanPath}`;
    }

    window.location.href = targetUrl;
  };

  // --- AUTO REDIRECT (If already logged in) ---
  useEffect(() => {
    if (status === "authenticated" && session?.user && bookingId) {
      if (session.user.bookingId === bookingId) {
        const slug = session.user.subdomainSlug || "app";
        handleRedirect(slug, bookingId);
      }
    }
  }, [status, session, bookingId]);

  // --- FORM SUBMIT ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingId) return;
    setIsSubmitting(true);

    try {
      const result = await signIn("booking-portal", {
        bookingId,
        pin,
        redirect: false,
      });

      if (result?.error) {
        toast.error("Incorrect PIN");
        setIsSubmitting(false);
        setPin(""); 
        return;
      }

      // Success! Fetch session to get the slug for the redirect
      const sessionReq = await fetch("/api/auth/session");
      const newSession = await sessionReq.json();
      const slug = newSession?.user?.subdomainSlug;
      
      if (slug) {
        toast.success("Access Granted");
        handleRedirect(slug, bookingId);
      } else {
        toast.error("Error: Could not find project URL.");
        setIsSubmitting(false);
      }

    } catch (error) {
      console.error(error);
      toast.error("Login failed");
      setIsSubmitting(false);
    }
  };

  // --- RENDER ---
  if (status === "loading" || isRedirecting || !bookingId) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <Loader2 className="w-10 h-10 text-gray-900 animate-spin mb-4" />
        <p className="text-gray-500 font-medium animate-pulse">
          {isRedirecting ? "Redirecting to project..." : "Verifying..."}
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
            ID: {bookingId}
          </p>
        </div>

        <div className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
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
                onChange={(e) => setPin(e.target.value)}
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
              {isSubmitting ? <Loader2 className="animate-spin w-5 h-5" /> : <>View Project <ArrowRight className="w-4 h-4" /></>}
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