// app/subdomains/[slug]/login/page.tsx
"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { signIn, useSession } from "next-auth/react";
import { useParams, useSearchParams } from "next/navigation";
import { Loader2, Lock } from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { getPublicUrl } from "@/lib/aws/cdn";

export default function SubdomainLoginPage() {
  return (
    <Suspense fallback={<div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin" /></div>}>
      <PinEntryForm />
    </Suspense>
  );
}

function PinEntryForm() {
  const searchParams = useSearchParams();
  const params = useParams();
  const slug = params.slug as string; // Get slug from URL path
  const huelineId = searchParams.get("huelineId");
  const { data: session, status, update } = useSession();
  
  const [pin, setPin] = useState(["", "", "", ""]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [logo, setLogo] = useState<string | null>(null);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // 1. AUTO REDIRECT (If already logged in)
  useEffect(() => {
    if (status === "authenticated" && session?.user && huelineId) {
      if (session.user.huelineId?.toLowerCase() === huelineId.toLowerCase()) {
        window.location.href = `/booking/${huelineId}`;
      }
    }
  }, [status, session, huelineId]);

   useEffect(() => {
    const fetchLogo = async () => {
      try {
        const res = await fetch(`/api/subdomain/${slug}/get-logo`);
        const data = await res.json();
        setLogo(data.logo);
      } catch (error) {
        console.error("Failed to fetch logo:", error);
      }
    };
    fetchLogo();
  }, [slug]);

  // 2. SUBMIT LOGIC
  const handlePinSubmit = async () => {
    const pinValue = pin.join("");
    if (pinValue.length !== 4) {
      toast.error("Please enter a 4-digit PIN");
      return;
    }

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
        setPin(["", "", "", ""]);
        inputRefs.current[0]?.focus();
        setIsSubmitting(false);
        return;
      }

      await update();
      window.location.href = `/booking/${huelineId}`;

    } catch (error) {
      console.error(error);
      toast.error("Login failed");
      setIsSubmitting(false);
    }
  };

  // 3. INPUT HANDLER
  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newPin = [...pin];
    newPin[index] = value;
    setPin(newPin);

    // Auto-focus next input
    if (value && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all 4 digits are entered
    if (newPin.every(digit => digit !== "") && index === 3) {
      handlePinSubmit();
    }
  };

  // Handle backspace
  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !pin[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // Handle paste
  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").slice(0, 4);
    if (!/^\d+$/.test(pastedData)) return;

    const newPin = [...pin];
    pastedData.split("").forEach((digit, i) => {
      if (i < 4) newPin[i] = digit;
    });
    setPin(newPin);

    // Focus last filled input or submit if complete
    const lastIndex = Math.min(pastedData.length - 1, 3);
    inputRefs.current[lastIndex]?.focus();

    if (pastedData.length === 4) {
      setTimeout(() => handlePinSubmit(), 100);
    }
  };

  const isPinComplete = pin.every(digit => digit !== "");

  const logoSrc = getPublicUrl(logo) || "/images/placeholder-logo.png";

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="bg-white max-w-sm w-full rounded-2xl shadow-xl border border-gray-100 p-8">
        <div className="text-center mb-8">
          {slug ? (
            <div className="w-20 h-20 mx-auto mb-4 relative">
              <Image
                src={logoSrc}
                alt="Company Logo"
                fill
                className="object-contain"
              />
            </div>
          ) : (
            <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-gray-100 text-gray-900">
              <Lock className="w-6 h-6" />
            </div>
          )}
          <h1 className="text-xl font-bold text-gray-900">Private Project</h1>
          {huelineId && (
            <p className="text-sm text-gray-500 mt-2 font-mono bg-gray-100 inline-block px-2 py-1 rounded">
              ID: {huelineId}
            </p>
          )}
        </div>

        <form onSubmit={(e) => { e.preventDefault(); handlePinSubmit(); }} className="space-y-6">
          <div className="space-y-3">
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest text-center">
              Enter 4-Digit PIN
            </label>
            <div className="flex gap-3 justify-center">
              {pin.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => { inputRefs.current[index] = el; }}
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={index === 0 ? handlePaste : undefined}
                  disabled={isSubmitting}
                  className="w-14 h-16 text-center text-2xl font-mono border-2 border-gray-200 rounded-xl focus:border-gray-900 outline-none transition-all text-gray-900 disabled:bg-gray-50"
                  autoFocus={index === 0}
                />
              ))}
            </div>
          </div>
          
          <Button
            type="submit"
            disabled={!isPinComplete || isSubmitting}
            className="w-full py-6 text-base font-medium"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="animate-spin w-5 h-5 mr-2" />
                Verifying...
              </>
            ) : (
              "Access Project"
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
