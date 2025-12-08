"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Logo from "@/public/images/logo-2--increased-brightness.png";
import Image from "next/image";
import { z } from "zod";
import { Loader2, UserCircle, Building2 } from "lucide-react";

// --- Validation Schemas ---
const partnerSchema = z.object({
  email: z.email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

const clientSchema = z.object({
  huelineId: z.string().min(3, "Invalid Hueline ID"),
  pin: z.string().min(4, "PIN must be at least 4 digits"),
});

export default function LoginPage() {
  const router = useRouter();
  
  // State
  const [loginMethod, setLoginMethod] = useState<"partner" | "client">("client");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  
  // Form State
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    huelineId: "",
    pin: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.id]: e.target.value }));
    setError(""); // Clear errors on type
  };

  // --- 1. HANDLE PARTNER LOGIN (SaaS Owner) ---
async function handlePartnerLogin(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    // Validate
    const validation = partnerSchema.safeParse({ 
      email: formData.email, 
      password: formData.password 
    });

    if (!validation.success) {
      setError(validation.error.issues[0].message);
      setIsLoading(false);
      return;
    }

    try {
      const res = await signIn("saas-account", {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });

      if (res?.error) {
        setError("Invalid email or password");
        setIsLoading(false);
        return;
      }

      // Success! Fetch session to get the slug
      const sessionReq = await fetch("/api/auth/session");
      const session = await sessionReq.json();
      const slug = session?.user?.subdomainSlug;

      if (slug) {
        const host = window.location.host; // e.g. "localhost:3000" or "app.hue-line.com"
        const protocol = window.location.protocol; // "http:" or "https:"

        if (host.includes("localhost")) {
          // ✅ FIX: Force redirect to the subdomain structure on localhost
          // This creates "http://acmepaint.localhost:3000/dashboard"
          window.location.href = `${protocol}//${slug}.localhost:3000/dashboard`;
        } else {
          // Production: Cross-domain redirect
          // e.g., app.hue-line.com -> joes-painting.hue-line.com/dashboard
          const rootDomain = host.split('.').slice(-2).join('.');
          window.location.href = `${protocol}//${slug}.${rootDomain}/dashboard`;
        }
      } else {
        // Fallback if no slug found (e.g. Super Admin)
        router.push("/form");
      }

    } catch (err) {
      console.error("Login error:", err);
      setError("An unexpected error occurred.");
      setIsLoading(false);
    }
  }

  // --- 2. HANDLE CLIENT LOGIN (Booking Portal) ---
  async function handleClientLogin(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    // Validate
    const validation = clientSchema.safeParse({ 
      huelineId: formData.huelineId, 
      pin: formData.pin 
    });

    if (!validation.success) {
      setError(validation.error.issues[0].message);
      setIsLoading(false);
      return;
    }

    try {
      const res = await signIn("booking-portal", {
        huelineId: formData.huelineId,
        pin: formData.pin,
        redirect: false,
      });

      if (res?.error) {
        setError("Invalid Hueline ID or PIN");
        setIsLoading(false);
        return;
      }

      // Success! Clients usually view their specific booking page or a generic dashboard
      // Since they don't own a subdomain, we keep them on the current domain
      router.push("/dashboard");
      router.refresh();

    } catch (err) {
      console.error("Login error:", err);
      setError("An unexpected error occurred.");
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-8 bg-gray-50 px-4">
      <Image src={Logo} width={140} height={140} alt="Logo" priority className="opacity-90" />
      
      <div className="bg-white shadow-xl rounded-2xl w-full max-w-[400px] overflow-hidden border border-gray-100">
        
        {/* Toggle Header */}
        <div className="flex border-b border-gray-100 bg-gray-50/50 p-1 m-2 rounded-xl">
          <button
            type="button"
            onClick={() => { setLoginMethod("client"); setError(""); }}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${
              loginMethod === "client" 
                ? "bg-white text-gray-900 shadow-sm ring-1 ring-black/5" 
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <UserCircle className="w-4 h-4" />
            Client Access
          </button>
          <button
            type="button"
            onClick={() => { setLoginMethod("partner"); setError(""); }}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${
              loginMethod === "partner" 
                ? "bg-white text-gray-900 shadow-sm ring-1 ring-black/5" 
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <Building2 className="w-4 h-4" />
            Partner Login
          </button>
        </div>

        <div className="p-8 pt-6">
          <h2 className="text-xl font-bold text-center text-gray-900 mb-2">
            {loginMethod === "partner" ? "Partner Dashboard" : "View Your Project"}
          </h2>
          <p className="text-center text-gray-500 text-sm mb-6">
            {loginMethod === "partner" 
              ? "Sign in to manage your subdomains and leads." 
              : "Enter your Hueline ID and PIN to view details."}
          </p>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-100 text-red-600 rounded-lg text-sm font-medium text-center animate-in fade-in slide-in-from-top-2">
              {error}
            </div>
          )}

          {/* --- PARTNER FORM --- */}
          {loginMethod === "partner" && (
            <form onSubmit={handlePartnerLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5 ml-1">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="name@company.com"
                  value={formData.email}
                  onChange={handleInputChange}
                  disabled={isLoading}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-black/5 focus:border-black transition-all outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5 ml-1">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleInputChange}
                  disabled={isLoading}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-black/5 focus:border-black transition-all outline-none"
                />
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-black text-white py-3 rounded-lg hover:bg-gray-800 disabled:opacity-70 disabled:cursor-not-allowed transition-all font-medium flex items-center justify-center gap-2 mt-2 shadow-lg shadow-gray-200"
              >
                {isLoading ? <Loader2 className="animate-spin h-5 w-5" /> : "Sign In"}
              </button>
            </form>
          )}

          {/* --- CLIENT FORM --- */}
          {loginMethod === "client" && (
            <form onSubmit={handleClientLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5 ml-1">
                  Hueline ID
                </label>
                <input
                  id="huelineId"
                  type="text"
                  placeholder="e.g. HL-9X2M4P"
                  value={formData.huelineId}
                  onChange={handleInputChange}
                  disabled={isLoading}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-black/5 focus:border-black transition-all outline-none font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5 ml-1">
                  Security PIN
                </label>
                <input
                  id="pin"
                  type="password"
                  placeholder="••••"
                  maxLength={6}
                  value={formData.pin}
                  onChange={handleInputChange}
                  disabled={isLoading}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-black/5 focus:border-black transition-all outline-none font-mono tracking-widest"
                />
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-black text-white py-3 rounded-lg hover:bg-gray-800 disabled:opacity-70 disabled:cursor-not-allowed transition-all font-medium flex items-center justify-center gap-2 mt-2 shadow-lg shadow-gray-200"
              >
                {isLoading ? <Loader2 className="animate-spin h-5 w-5" /> : "Access Project"}
              </button>
            </form>
          )}

        </div>
      </div>
      
      <p className="text-xs text-gray-400">
        &copy; {new Date().getFullYear()} Hue-Line. All rights reserved.
      </p>
    </div>
  );
}