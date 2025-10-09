"use client";

import { useState, useRef, useEffect } from "react";
import { signIn } from "next-auth/react";
import { useSearchParams, useRouter } from "next/navigation";

export default function BookingLoginContent() {
  const [pin, setPin] = useState(["", "", "", ""]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const searchParams = useSearchParams();
  const router = useRouter();
  const bookingId = searchParams.get("bookingId");

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handleChange = (index: number, value: string) => {
    if (!/^\d?$/.test(value)) return;
    
    const newPin = [...pin];
    newPin[index] = value;
    setPin(newPin);
    setError("");

    if (value && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }
    
    if (newPin.every(digit => digit) && index === 3) {
      handleSubmit(newPin.join(""));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace") {
      if (!pin[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
      } else if (pin[index]) {
        const newPin = [...pin];
        newPin[index] = "";
        setPin(newPin);
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < 3) {
      inputRefs.current[index + 1]?.focus();
    } else if (e.key === "Enter") {
      handleSubmit();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text');
    const numbers = pastedData.replace(/\D/g, '').slice(0, 4);
    
    if (numbers.length === 4) {
      const newPin = numbers.split('');
      setPin(newPin);
      setError("");
      inputRefs.current[3]?.focus();
      setTimeout(() => handleSubmit(numbers), 100);
    }
  };

  const handleSubmit = async (enteredPin?: string) => {
    if (!bookingId) {
      setError("No booking ID provided");
      return;
    }
    
    const finalPin = enteredPin || pin.join("");
    
    if (finalPin.length !== 4) {
      setError("Please enter a 4-digit PIN");
      return;
    }

    if (!/^\d{4}$/.test(finalPin)) {
      setError("PIN must contain only numbers");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      console.log("🔐 Verifying PIN for booking:", bookingId);

      const response = await fetch(`/api/booking/${bookingId}/auth`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ pin: finalPin }),
      });

      const data = await response.json();

      if (response.ok) {
        console.log("✅ PIN verified, signing in with NextAuth...");
        
        const result = await signIn("booking", {
          bookingId,
          pin: finalPin,
          redirect: false,
        });

        console.log("📋 NextAuth signIn result:", result);

        if (result?.error) {
          console.error("❌ NextAuth error:", result.error);
          setError("Authentication failed. Please try again.");
        } else if (result?.ok) {
          console.log("✅ Login successful, redirecting...");
          router.push(`/booking/${bookingId}`);
          router.refresh();
        }
      } else {
        console.error("❌ PIN verification failed:", data.error);
        setError(data.error || "Invalid PIN");
        setPin(["", "", "", ""]);
        inputRefs.current[0]?.focus();
      }
    } catch (error) {
      console.error("❌ Network error:", error);
      setError("Network error. Please check your connection and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const clearPin = () => {
    setPin(["", "", "", ""]);
    setError("");
    inputRefs.current[0]?.focus();
  };

  if (!bookingId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full mx-4">
          <div className="bg-white p-8 rounded-lg shadow-md text-center">
            <div className="text-red-500 text-6xl mb-4">❌</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Booking ID Missing</h1>
            <p className="text-gray-600 mb-6">
              No booking ID was provided. Please check your link and try again.
            </p>
            <button
              onClick={() => router.push("/")}
              className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-200"
            >
              Go Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full mx-auto">
        <div className="bg-white p-8 rounded-lg shadow-md">
          <div className="text-center mb-8">
            <div className="mx-auto h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <svg 
                className="h-6 w-6 text-blue-600" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" 
                />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Enter Your PIN
            </h1>
            <p className="text-gray-600">
              Please enter the 4-digit PIN for booking{" "}
              <span className="font-mono font-semibold text-blue-600">
                {bookingId}
              </span>
            </p>
          </div>

          <div className="mb-6">
            <div className="flex justify-center gap-3 mb-4">
              {pin.map((digit, index) => (
                <input
                  key={index}
                  ref={el => { inputRefs.current[index] = el; }}
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={index === 0 ? handlePaste : undefined}
                  disabled={isLoading}
                  className={`
                    w-14 h-14 text-2xl text-center border-2 rounded-lg
                    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                    transition-all duration-200
                    ${digit ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}
                    ${isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:border-gray-400'}
                    font-semibold
                  `}
                />
              ))}
            </div>

            {error && (
              <div className="text-center">
                <p className="text-red-500 text-sm bg-red-50 py-2 px-4 rounded-lg border border-red-200">
                  {error}
                </p>
              </div>
            )}
          </div>

          <div className="flex gap-3">
            <button
              onClick={clearPin}
              disabled={isLoading}
              className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200"
            >
              Clear
            </button>
            <button
              onClick={() => handleSubmit()}
              disabled={isLoading || pin.some(digit => !digit)}
              className="flex-1 px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200 font-semibold"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Verifying...
                </div>
              ) : (
                "Submit"
              )}
            </button>
          </div>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              Can&apos;t find your PIN? Check your booking confirmation SMS.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}