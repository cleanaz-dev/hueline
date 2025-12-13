"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image"; 
// Make sure this path is correct for your project
import Logo from "@/public/images/logo-2--increased-brightness.png"; 
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
    setError(""); 
  };

  // --- 1. HANDLE PARTNER LOGIN (SaaS Owner) ---
  async function handlePartnerLogin(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    // 1. Validate Input
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
      // 2. Attempt Login
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

      // 3. Login Successful - Now Determine Destination
      // We need to fetch the session to know WHICH subdomain this user owns
      const sessionReq = await fetch("/api/auth/session");
      const session = await sessionReq.json();
      const slug = session?.user?.subdomainSlug;

      if (slug) {
        const protocol = window.location.protocol; // "http:" or "https:"
        const host = window.location.host;         // "localhost:3000" or "app.hue-line.com"

        // 🟢 LOCALHOST LOGIC
        if (host.includes("localhost")) {
          // Force redirect to: http://tesla.localhost:3000/
          window.location.href = `${protocol}//${slug}.localhost:3000/`;
        } 
        // 🌍 PRODUCTION LOGIC
        else {
           // We need to get the "root" domain (hue-line.com) to append the slug
           // This handles "app.hue-line.com" or just "hue-line.com"
           const parts = host.split('.');
           const rootDomain = parts.length >= 2 
             ? parts.slice(-2).join('.')  // grab last two parts: "hue-line.com"
             : host;
             
           // Force redirect to: https://tesla.hue-line.com/
           window.location.href = `${protocol}//${slug}.${rootDomain}/`;
        }
      } else {
        // Fallback: If they are a Super Admin or have no subdomain, go to generic dashboard
        router.push("/dashboard");
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

      // Clients just go to the specific booking page
      // Usually: /booking/[huelineId]
      // Or if you use a generic dashboard for them:
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
      {/* Ensure Logo is imported correctly */}
      <Image src={Logo} width={140} height={140} alt="Logo" priority className="opacity-90" />
      
      <div className="bg-white shadow-xl rounded-2xl w-full max-w-[400px] overflow-hidden border border-gray-100">
        
        {/* Toggle Header */}
        <div className="flex border-b border-gray-100 bg-gray-50/50 p-1 m-2 rounded-xl">
          <button
            type="button"
            onClick={() => { setLoginMethod("client"); setError(""); }}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 cursor-pointer ${
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
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 cursor-pointer ${
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
                className="w-full bg-black text-white py-3 rounded-lg hover:bg-gray-800 disabled:opacity-70 disabled:cursor-not-allowed transition-all font-medium flex items-center justify-center gap-2 mt-2 shadow-lg shadow-gray-200 cursor-pointer"
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
                className="w-full bg-black text-white py-3 rounded-lg hover:bg-gray-800 disabled:opacity-70 disabled:cursor-not-allowed transition-all font-medium flex items-center justify-center gap-2 mt-2 shadow-lg shadow-gray-200 cursor-pointer"
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