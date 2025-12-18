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
  ShieldAlert,
  Search,
} from "lucide-react";
import { getPublicUrl } from "@/lib/aws/cdn";

export default function SubdomainNav({
  miniNav = true,
  data,
}: {
  data: Pick<SubdomainAccountData, "logo" | "logoWidth" | "logoHeight">;
  miniNav?: boolean;
}) {
  const { data: session, status } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [showMiniNav, setShowMiniNav] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const lastScrollY = useRef(0);

  // Handle click outside dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handle scroll detection
  useEffect(() => {
    // Only set up scroll listener if miniNav is enabled
    if (!miniNav) return;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Only show mini nav if we've scrolled past 100px
      if (currentScrollY < 100) {
        setShowMiniNav(false);
        lastScrollY.current = currentScrollY;
        return;
      }

      // Check scroll direction
      if (currentScrollY > lastScrollY.current) {
        // Scrolling down - show mini nav
        setShowMiniNav(true);
      } else {
        // Scrolling up - hide mini nav
        setShowMiniNav(false);
      }

      lastScrollY.current = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [miniNav]);

  // SAFETY CHECK
  if (status === "loading") return <nav className="bg-white h-24 border-b" />;
  if (!session?.user) return null;

  // DEFINE ROLES
  // @ts-ignore
  const rawRole = session.role || session.user?.role || "undefined";

  const isCustomer = rawRole === "customer";
  const isSuperAdmin =
    rawRole === "saas_owner" ||
    rawRole === "SUPER_ADMIN" ||
    rawRole === "admin" ||
    rawRole === "OWNER";
  const isBusinessOwner = !isCustomer && !isSuperAdmin;

  const logoSrc = getPublicUrl(data.logo) || "/placeholder-logo.png";

  return (
    <>
      {/* Main Nav */}
      <nav className="bg-white border-b border-gray-200 h-16 md:h-24 sticky top-0 z-40">
        <div className="px-4 md:px-8 h-full flex items-center justify-between max-w-7xl mx-auto">
          {/* Left Spacer */}
          <div className="w-20"></div>

          {/* Center Logo */}
          <div className="flex-shrink-0 relative h-16 w-32 md:w-56">
            <Image src={logoSrc} alt="Logo" fill className="object-contain" />
          </div>

          {/* Right Menu */}
          <div className="w-20 flex justify-end">
            {isCustomer ? (
              <button
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="group flex items-center justify-center w-9 h-9 rounded-full hover:bg-gray-100 transition-colors text-gray-400 hover:text-red-600"
                title="Sign Out"
              >
                <LogOut className="w-5 h-5 ml-0.5" />
              </button>
            ) : (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsOpen(!isOpen)}
                  className="flex items-center gap-2 p-1.5 rounded-full hover:bg-gray-50 transition-all border border-transparent hover:border-gray-200"
                >
                  <div
                    className={`h-9 w-9 rounded-full text-white flex items-center justify-center shadow-sm ${
                      isSuperAdmin ? "bg-purple-600" : "bg-black"
                    }`}
                  >
                    <span className="text-xs font-semibold">
                      {session.user.email?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <ChevronDown
                    className={`w-4 h-4 text-gray-400 transition-transform ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50">
                    {/* User Info Header */}
                    <div className="px-4 py-2 border-b border-gray-50 mb-1">
                      <div className="flex justify-between">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {session.user.name || "User"}
                        </p>
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                          {rawRole}
                        </span>
                      </div>

                      <p className="text-xs text-gray-500 truncate mb-2">
                        {session.user.email}
                      </p>
                    </div>

                    {/* SUPER ADMIN LINKS */}

                    {/* BUSINESS OWNER LINKS */}
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

      {/* Mini Nav for Super Admins (appears on scroll) */}
      {isSuperAdmin && miniNav && (
        <div
          className={`fixed top-0 left-0 right-0 bg-white border-b border-gray-200 shadow-md z-50 transition-transform duration-300 ${
            showMiniNav ? "translate-y-0" : "-translate-y-full"
          }`}
        >
          <div className="px-4 md:px-8 h-14 flex items-center justify-between max-w-7xl mx-auto">
            {/* Dashboard Link */}
            <Link
              href="/"
              className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-black transition-colors"
            >
              <LayoutDashboard className="w-4 h-4" />
              Dashboard
            </Link>

            {/* Search Bar */}
            <div className="flex-1 max-w-md mx-8">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search bookings..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* User Avatar */}
            <div className="h-8 w-8 rounded-full bg-purple-600 text-white flex items-center justify-center shadow-sm">
              <span className="text-xs font-semibold">
                {session.user.email?.charAt(0).toUpperCase()}
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
