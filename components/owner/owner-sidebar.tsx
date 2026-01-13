"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  DoorOpen,
  Phone,
  BrainCircuit,
  Settings,
  LogOut,
  ChevronsUpDown,
  Sparkles,
  Search,
  Bell,
  Cpu,
  Plus,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarSeparator,
  SidebarTrigger,
  SidebarInset,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useOwner } from "@/context/owner-context";
import { useSession, signOut } from "next-auth/react";
import { Button } from "../ui/button";

// Menu Configuration
const navMain = [
  { title: "Dashboard", url: "/my/dashboard", icon: LayoutDashboard },
  { title: "Rooms", url: "/my/rooms", icon: DoorOpen },
  { title: "Calls", url: "/my/calls", icon: Phone },
  { title: "Intelligence", url: "/my/intelligence", icon: Cpu },
];

function AppSidebar() {
  const pathname = usePathname();
  const { subdomain } = useOwner();
  const { setOpenMobile } = useSidebar();

  const { data: session } = useSession();
  const user = session?.user;

  const userInitials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
    : "U";

  return (
    <Sidebar collapsible="icon" className="">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground transition-all"
            >
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-accent text-white shadow-md">
                {subdomain.companyName?.slice(0, 1)}
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold tracking-tight">
                  {subdomain.companyName}
                </span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Platform</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navMain.map((item) => {
                const isActive = pathname.startsWith(item.url);
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      tooltip={item.title}
                      isActive={isActive}
                    >
                      <Link
                        href={item.url}
                        onClick={() => setOpenMobile(false)}
                      >
                        <item.icon />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                >
                  <Avatar className="h-8 w-8 rounded-lg border border-border/50">
                    <AvatarImage
                      src={user?.image || ""}
                      alt={user?.name || "User"}
                    />
                    <AvatarFallback className="rounded-lg bg-zinc-100 font-medium text-zinc-600">
                      {userInitials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">
                      {user?.name || "User"}
                    </span>
                    <span className="truncate text-xs data-[state=open]:text-muted-foreground">
                      {user?.email}
                    </span>
                  </div>
                  <ChevronsUpDown className="ml-auto size-4" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                side="bottom"
                align="end"
                sideOffset={4}
              >
                <DropdownMenuLabel className="p-0 font-normal">
                  <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                    <Avatar className="h-8 w-8 rounded-lg">
                      <AvatarImage
                        src={user?.image || ""}
                        alt={user?.name || ""}
                      />
                      <AvatarFallback className="rounded-lg">
                        {userInitials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-semibold">
                        {user?.name}
                      </span>
                      <span className="truncate text-xs">{user?.email}</span>
                    </div>
                  </div>
                </DropdownMenuLabel>

                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem asChild>
                    <Link
                      className="cursor-pointer"
                      href="/my/account"
                      onClick={() => setOpenMobile(false)}
                    >
                      <Settings className="mr-2 size-4 hover:text-white" />
                      Account
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="cursor-pointer text-destructive focus:bg-red-500 focus:text-white data-[highlighted]:bg-red-500 data-[highlighted]:text-white"
                  onClick={() => signOut({ callbackUrl: "/login" })}
                >
                  <LogOut className="mr-2 size-4 hover:text-white" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}

export default function OwnerSidebar({
  children,
}: {
  children: React.ReactNode;
}) {
  const { subdomain } = useOwner();
  const pathname = usePathname();

  const pageTitle =
    pathname.split("/").pop()?.replace(/-/g, " ") || "Dashboard";
  const formattedTitle = pageTitle.charAt(0).toUpperCase() + pageTitle.slice(1);

  return (
    <SidebarProvider>
      <AppSidebar />

      <SidebarInset className="flex flex-col overflow-hidden">
        {/* Fixed Header */}
        <header className="flex-shrink-0 h-16 flex items-center gap-2 border-b border-border/40 px-4 md:px-6 bg-background">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="-ml-1" />
            <SidebarSeparator orientation="vertical" className="mr-2 h-4" />

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span className="font-medium text-foreground hidden sm:block">
                {subdomain.companyName}
              </span>
              <span className="text-border hidden sm:block">/</span>
              <span className="font-semibold text-foreground">
                {formattedTitle}
              </span>
            </div>
          </div>

          <div className="ml-auto flex items-center gap-2 md:gap-4">
            <div className="relative hidden sm:block">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <input
                placeholder="Search..."
                className="h-9 w-48 md:w-64 rounded-md border border-input bg-muted/30 pl-9 text-sm outline-none focus:ring-1 focus:ring-ring transition-all hover:bg-muted/50"
              />
              <div className="absolute right-2 top-2 hidden items-center gap-1 opacity-50 md:flex">
                <span className="text-[10px] font-medium border rounded px-1.5 bg-background">
                  ⌘K
                </span>
              </div>
            </div>

            <button className="relative flex h-8 w-8 items-center justify-center rounded-full hover:bg-accent transition-colors group">
              <Bell className="h-4 w-4 text-muted-foreground group-hover:text-white" />
              <span className="absolute top-2 right-2.5 h-1.5 w-1.5 rounded-full bg-blue-600 ring-2 ring-background" />
            </button>
          </div>
        </header>

        {/* Scrollable Content Area */}
        <main className="flex-1 overflow-auto bg-background">
          <div className="h-full p-0 md:p-6">
            <div className="h-full bg-muted/10 rounded-xl border border-border/40 p-4 md:p-6 overflow-auto">
              {children}
            </div>
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
