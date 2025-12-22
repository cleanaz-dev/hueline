"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { 
  LayoutDashboard, 
  FileText, 
  ScrollText, 
  Users2, 
  Menu, 
  Settings, 
  LogOut,
  ChevronRight,
  ShieldCheck,
  Route
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSuperAdmin } from "@/context/super-admin-context";
import { signOut } from "next-auth/react";

const navItems = [
  {
    title: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
  },
  {
    title: "Intake Form",
    href: "/intake-form",
    icon: FileText,
  },
  {
    title: "Logs",
    href: "/logs",
    icon: ScrollText,
  },
  {
    title: "Clients",
    href: "/clients",
    icon: Users2,
  },
  {
    title: "Flow",
    href: "/call-flow",
    icon: Route
  }
];

export default function SuperAdminSidebar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const { admin } = useSuperAdmin()

  const NavLinks = ({ isMobile = false }: { isMobile?: boolean }) => (
    <div className="flex flex-col gap-1">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href;

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setOpen(false)}
            className={cn(
              "group relative flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-300 ease-in-out",
              // Active State: Gradient background, white text, subtle shadow
              isActive 
                ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20" 
                : "text-slate-400 hover:bg-slate-800/50 hover:text-white",
            )}
          >
            <Icon className={cn("h-5 w-5 transition-transform group-hover:scale-110", isActive && "animate-pulse-once")} />
            <span>{item.title}</span>
            
            {/* Active Indicator for Desktop */}
            {isActive && !isMobile && (
               <ChevronRight className="ml-auto h-4 w-4 opacity-50" />
            )}
          </Link>
        );
      })}
    </div>
  );

  return (
    <>
      {/* Mobile Navigation - Top Bar with Glassmorphism */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 border-b border-slate-200 bg-white/80 backdrop-blur-md">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <span className="font-bold text-slate-900">AdminPanel</span>
          </div>
          
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="text-slate-600">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 bg-slate-950 p-0 text-slate-200 border-r-slate-800">
              <SheetHeader className="p-6 border-b border-slate-800 text-left">
                <SheetTitle className="flex items-center gap-2 text-white">
                  <ShieldCheck className="h-6 w-6 text-blue-500" />
                  <span className="text-lg font-bold">Admin Portal</span>
                </SheetTitle>
              </SheetHeader>
              <nav className="flex-1 px-4 py-6">
                <NavLinks isMobile />
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Desktop Sidebar - Premium Dark Theme */}
      <aside className="hidden lg:flex lg:flex-col lg:fixed lg:inset-y-0 lg:w-64 bg-slate-950 border-r border-slate-800 shadow-2xl transition-all">
        {/* Logo Section */}
        <div className="flex h-20 items-center gap-3 px-6 border-b border-slate-800/60 bg-slate-950/50">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/20">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-bold text-white tracking-tight">AdminPanel</span>
            <span className="text-xs font-medium text-slate-400">Super Admin</span>
          </div>
        </div>

        <div className="flex flex-col h-full justify-between">
          {/* Main Navigation */}
          <nav className="flex-1 px-4 py-8 space-y-8 overflow-y-auto">
            <div>
              <p className="mb-4 px-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                Menu
              </p>
              <NavLinks />
            </div>

            <div>
              <p className="mb-4 px-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                Settings
              </p>
              <div className="flex flex-col gap-1">
                <Button 
                  variant="ghost" 
                  className="w-full justify-start gap-3 px-4 py-3 text-slate-400 hover:text-white hover:bg-slate-800/50 rounded-xl font-medium"
                >
                  <Settings className="h-5 w-5" />
                  <span>General Settings</span>
                </Button>
              </div>
            </div>
          </nav>

          {/* User Profile Footer */}
          <div className="p-4 border-t border-slate-800/60 bg-slate-900/30">
            <div className="flex items-center gap-3 rounded-xl bg-slate-900 p-3 shadow-inner ring-1 ring-inset ring-slate-800 transition-colors hover:bg-slate-800">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-700 text-slate-300">
                <span className="font-semibold">PH</span>
              </div>
              <div className="flex flex-1 flex-col overflow-hidden">
                <span className="truncate text-sm font-semibold text-white">
                  {admin?.name}
                </span>
                <span className="truncate text-xs text-slate-400">
                 {admin?.email}
                </span>
              </div>
              <Button 
                size="icon" 
                variant="ghost" 
                className="h-8 w-8 text-slate-400 hover:text-red-400 hover:bg-red-950/30"
                onClick={ async () => signOut({ callbackUrl: process.env.NEXTAUTH_URL })}
                
                >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </aside>

      {/* Spacer for mobile top bar (matches mobile header height) */}
      <div className="lg:hidden h-[65px]" />
    </>
  );
}