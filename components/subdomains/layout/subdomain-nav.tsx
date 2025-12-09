"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { SubdomainAccountData } from "@/types/subdomain-type";
import { 
  LogOut, 
  LayoutDashboard, 
  User, 
  ChevronDown,
  Settings,
  ShieldAlert
} from "lucide-react";
import { getPublicUrl } from "@/lib/aws/cdn";

export default function SubdomainNav({
  data,
}: {
  data: Pick<SubdomainAccountData, "logo" | "logoWidth" | "logoHeight">;
}) {
  const { data: session, status } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // 1. SAFETY CHECK: If loading, show empty nav. If not logged in, show nothing.
  if (status === "loading") return <nav className="bg-white h-24 border-b" />; 
  if (!session?.user) return null; // Or return a "Login" button here

  // 2. DEFINE ROLES (With Safe Fallbacks)
  // We check session.role AND session.user.role because setups vary
  // @ts-ignore - Ignoring TS warning to check both locations for safety
  const rawRole = session.role || session.user?.role || "undefined";
  
  const isCustomer = rawRole === "customer";
  const isSuperAdmin = rawRole === "saas_owner" || rawRole === "SUPER_ADMIN";
  // If not a customer and not a super admin, treat as Business Owner
  const isBusinessOwner = !isCustomer && !isSuperAdmin;

  const logoSrc = getPublicUrl(data.logo) || "/images/placeholder-logo.png";

  return (
    <nav className="bg-white border-b border-gray-200 h-24 sticky top-0 z-40">
      <div className="px-8 h-full flex items-center justify-between max-w-7xl mx-auto">
        
        {/* Left Spacer */}
        <div className="w-20"></div>

        {/* Center Logo */}
        <div className="flex-shrink-0 relative h-16 w-56">
          <Image
            src={logoSrc}
            alt="Logo"
            fill
            className="object-contain"
          />
        </div>

        {/* Right Menu */}
        <div className="w-20 flex justify-end">

            {/* SCENARIO 1: CUSTOMER (Only has Exit button) */}
            {isCustomer ? (
              <button
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="group flex items-center justify-center w-9 h-9 rounded-full hover:bg-gray-100 transition-colors text-gray-400 hover:text-red-600"
                title="Sign Out"
              >
                <LogOut className="w-5 h-5 ml-0.5" />
              </button>
            ) : (
            
            /* SCENARIO 2: EVERYONE ELSE (Admin, Owner, Partner, User) */
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 p-1.5 rounded-full hover:bg-gray-50 transition-all border border-transparent hover:border-gray-200"
              >
                <div className={`h-9 w-9 rounded-full text-white flex items-center justify-center shadow-sm ${isSuperAdmin ? "bg-purple-600" : "bg-black"}`}>
                  <span className="text-xs font-semibold">
                    {session.user.email?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""}`} />
              </button>

              {isOpen && (
                <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50">
                  
                  {/* User Info Header */}
                  <div className="px-4 py-2 border-b border-gray-50 mb-1">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {session.user.name || "User"}
                    </p>
                    <p className="text-xs text-gray-500 truncate mb-2">
                      {session.user.email}
                    </p>
                    {/* DEBUG BADGE: Remove this once you verify your role */}
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                      Role: {rawRole}
                    </span>
                  </div>

                  {/* SUPER ADMIN LINKS */}
                  {isSuperAdmin && (
                    <Link
                      href="/admin"
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-purple-700 hover:bg-purple-50 transition-colors"
                      onClick={() => setIsOpen(false)}
                    >
                      <ShieldAlert className="w-4 h-4" />
                      Super Admin
                    </Link>
                  )}

                  {/* BUSINESS OWNER LINKS (Standard Dashboard) */}
                  <Link
                    href="/"
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-black transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    Dashboard
                  </Link>
                  
                  <Link
                    href="/my-account"
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-black transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    <User className="w-4 h-4" />
                    My Account
                  </Link>

                  <div className="my-1 border-t border-gray-50" />

                  <button
                    onClick={() => signOut({ callbackUrl: "/login" })}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors text-left"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
            )}
        </div>
      </div>
    </nav>
  );
}