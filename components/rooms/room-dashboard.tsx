"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { v4 as uuidv4 } from "uuid";
import axios from "axios";
import { useOwner } from "@/context/owner-context";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Video,
  User,
  Phone,
  Target,
  ArrowRight,
  Zap,
  FolderOpen,
  Calendar,
  DoorOpen,
} from "lucide-react";
import RoomIntelligenceCard from "./room-intelligence-card";
import { cn } from "@/lib/utils";
import RoomList from "./room-list";

export default function RoomsDashboard() {
  const [mode, setMode] = useState<"project" | "quick">("project");

  // Project Mode State
  const [selectedBookingId, setSelectedBookingId] = useState<string>("");
  const [projectName, setProjectName] = useState("");

  // Quick Mode State
  const [quickClientName, setQuickClientName] = useState("");
  const [quickRoomName, setQuickRoomName] = useState("");

  const [isCreating, setIsCreating] = useState(false);
  const router = useRouter();
  const { subdomain } = useOwner();

  const selectedBooking = subdomain.bookings?.find(
    (b) => b.id === selectedBookingId
  );

  // 1. Auto-Name: Linked Project
  useEffect(() => {
    if (selectedBooking && mode === "project") {
      const today = new Date();
      const dateStr = `${String(today.getMonth() + 1).padStart(2, "0")}${String(
        today.getDate()
      ).padStart(2, "0")}${today.getFullYear()}`;
      const clientNameLower = selectedBooking.name
        .toLowerCase()
        .replace(/\s+/g, "");
      setProjectName(`${clientNameLower}-${dateStr}`);
    }
  }, [selectedBookingId, selectedBooking, mode]);

  // 2. Auto-Name: Quick Session
  useEffect(() => {
    if (quickClientName && mode === "quick") {
      const today = new Date();
      const dateStr = `${String(today.getMonth() + 1).padStart(2, "0")}${String(
        today.getDate()
      ).padStart(2, "0")}${today.getFullYear()}`;
      const clientNameLower = quickClientName.toLowerCase().replace(/\s+/g, "");
      setQuickRoomName(`${clientNameLower}-${dateStr}`);
    }
  }, [quickClientName, mode]);

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === "project" && (!projectName || !selectedBookingId)) return;
    if (mode === "quick" && (!quickRoomName || !quickClientName)) return;
    if (isCreating) return;

    setIsCreating(true);

    try {
      const today = new Date();
      const dateStr = `${String(today.getMonth() + 1).padStart(2, "0")}${String(
        today.getDate()
      ).padStart(2, "0")}${today.getFullYear()}`;

      let roomId = "";
      let payload = {};

      if (mode === "project") {
        const slug =
          selectedBooking?.name.toLowerCase().replace(/\s+/g, "") || "project";
        roomId = `${slug}-${dateStr}-${uuidv4().slice(0, 4)}`;
        payload = {
          bookingId: selectedBookingId,
          roomName: projectName,
          clientName: selectedBooking?.name,
          clientPhone: selectedBooking?.phone,
          sessionType: "PROJECT", // Changed from type to sessionType
        };
      } else {
        const slug =
          quickClientName.toLowerCase().replace(/\s+/g, "") || "quick";
        roomId = `${slug}-${dateStr}-${uuidv4().slice(0, 4)}`;
        payload = {
          roomName: quickRoomName,
          clientName: quickClientName,
          sessionType: "QUICK", // Changed from type to sessionType
        };
      }

      const response = await axios.post(
        `/api/subdomain/${subdomain.slug}/room/${roomId}`,
        payload
      );

      if (response.data) {
        if (mode === "quick") {
          router.push(`/my/rooms/quick-session/${roomId}`);
        } else {
          router.push(`/my/rooms/${roomId}`);
        }
      }
    } catch (error) {
      console.error("Error creating room:", error);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="my-room-container">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 bg-zinc-100 rounded-2xl  items-center justify-center border border-zinc-200 shadow-sm hidden md:flex">
            <DoorOpen className="w-7 h-7 text-zinc-700" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              Live Rooms{" "}
            </h1>
            <p className="text-zinc-500 ">
              Bridge the gap between a lead and a contract with a virtual
              walkthrough.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-stretch">
        {/* --- LEFT COLUMN: CONTROL CENTER (3/5) --- */}
        <form
          onSubmit={handleCreateRoom}
          className="lg:col-span-3 flex flex-col h-full"
        >
          <Card className="border-zinc-200 shadow-sm flex-1 flex flex-col">
            <CardHeader className="pb-4">
              {/* Custom Toggle Switch */}
              <div className="grid grid-cols-2 p-1 bg-zinc-100 rounded-lg mb-4">
                <button
                  type="button"
                  onClick={() => setMode("project")}
                  className={cn(
                    "flex items-center justify-center gap-2 py-2 text-sm font-bold rounded-md transition-all cursor-pointer hover:text-primary",
                    mode === "project"
                      ? "bg-white text-zinc-900 shadow-sm"
                      : "text-zinc-500 hover:text-accent"
                  )}
                >
                  <FolderOpen className="w-4 h-4" />
                  Linked Project
                </button>
                <button
                  type="button"
                  onClick={() => setMode("quick")}
                  className={cn(
                    "flex items-center justify-center gap-2 py-2 text-sm font-bold rounded-md transition-all cursor-pointer hover:text-primary",
                    mode === "quick"
                      ? "bg-white text-blue-600 shadow-sm"
                      : "text-zinc-500 hover:text-accent"
                  )}
                >
                  <Zap className="w-4 h-4" />
                  Quick Session
                </button>
              </div>

              <CardTitle className="text-xl">
                {mode === "project" ? "Select Project" : "New Session Details"}
              </CardTitle>
              <CardDescription>
                {mode === "project"
                  ? "Link this room to an existing CRM lead."
                  : "Create an instant room for a new or ad-hoc client."}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6 flex-1">
              {mode === "project" ? (
                /* LINKED PROJECT FORM */
                <div className="space-y-6 animate-in fade-in slide-in-from-left-4 duration-300">
                  <div className="space-y-2">
                    <Label htmlFor="booking-select" className="text-zinc-700">
                      Active Project
                    </Label>
                    <Select
                      value={selectedBookingId}
                      onValueChange={setSelectedBookingId}
                    >
                      <SelectTrigger
                        id="booking-select"
                        className="h-12 border-zinc-300"
                      >
                        <SelectValue placeholder="Search projects..." />
                      </SelectTrigger>
                      <SelectContent>
                        {subdomain.bookings?.map((booking) => (
                          <SelectItem key={booking.id} value={booking.id}>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-zinc-900">
                                {booking.name}
                              </span>
                              <span className="text-[10px] uppercase text-zinc-400 tracking-wider">
                                ID: {booking.huelineId}
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-zinc-700">Room Title</Label>
                    <Input
                      className="border-zinc-300"
                      placeholder="e.g. Living Room Walkthrough"
                      value={projectName}
                      onChange={(e) => setProjectName(e.target.value)}
                    />
                  </div>
                </div>
              ) : (
                /* QUICK SESSION FORM */
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                  <div className="space-y-2">
                    <Label className="text-zinc-700">Client Name</Label>
                    <Input
                      className=" border-zinc-300"
                      placeholder="Who are we meeting?"
                      value={quickClientName}
                      onChange={(e) => setQuickClientName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-zinc-700">Room Title</Label>
                    <Input
                      className="border-zinc-300"
                      placeholder="e.g. Exterior Estimate"
                      value={quickRoomName}
                      onChange={(e) => setQuickRoomName(e.target.value)}
                    />
                  </div>
                </div>
              )}
            </CardContent>

            {/* Footer Action */}
            <div className="p-6 pt-0 mt-auto">
              <Button
                type="submit"
                size="lg"
                className={cn(
                  "w-full text-lg font-bold shadow-lg transition-all",
                  mode === "quick" ? "bg-blue-600 hover:bg-blue-700" : ""
                )}
                disabled={
                  isCreating ||
                  (mode === "project" ? !projectName : !quickRoomName)
                }
              >
                {isCreating
                  ? "Initializing..."
                  : mode === "project"
                  ? "Launch Linked Room"
                  : "Start Quick Session"}
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </div>
          </Card>
        </form>

        {/* --- RIGHT COLUMN: CONTEXT BRIEF (2/5) --- */}
        <div className="lg:col-span-2 flex flex-col h-full">
          {mode === "project" ? (
            /* SCENARIO A: LINKED PROJECT CARD */
            selectedBooking ? (
              <Card className="bg-card text-foreground border-none sticky top-6 h-full shadow-sm">
                <CardHeader className="border-b border-zinc-100">
                  <div className="flex justify-between items-start">
                    <Badge
                      variant="secondary"
                      className="bg-zinc-100 text-zinc-600 border-zinc-200"
                    >
                      Project Data
                    </Badge>
                    <span className="text-primary text-xs font-mono">
                      {selectedBooking.huelineId}
                    </span>
                  </div>
                  <CardTitle className="text-2xl pt-2">
                    {selectedBooking.name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6 pt-6">
                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-primary" />
                    <div>
                      <p className="text-xs text-zinc-500 uppercase">Contact</p>
                      <p className="text-sm font-medium">
                        {selectedBooking.phone}
                      </p>
                    </div>
                  </div>
                  {selectedBooking.estimatedValue !== undefined &&
                    selectedBooking.estimatedValue !== null && (
                      <div className="p-4 rounded-2xl bg-gray-50 border">
                        <p className="text-xs text-primary uppercase font-bold tracking-widest">
                          Potential Value
                        </p>
                        <p className="text-3xl">
                          ${selectedBooking.estimatedValue.toLocaleString()}
                        </p>
                      </div>
                    )}
                  {selectedBooking.projectScope &&
                    selectedBooking.projectScope.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-xs text-zinc-500 uppercase font-bold tracking-widest">
                          Planned Scope
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {selectedBooking.projectScope.map((scope, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-1 bg-zinc-100 rounded text-[11px] font-medium text-zinc-700"
                            >
                              {scope}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                </CardContent>
              </Card>
            ) : (
              <div className="h-full border-2 bg-muted border-dashed border-zinc-200 rounded-xl flex flex-col items-center justify-center p-8 text-center text-zinc-400">
                <User className="w-12 h-12 mb-4 opacity-20" />
                <p className="text-sm">Select a project to view details.</p>
              </div>
            )
          ) : (
            /* SCENARIO B: QUICK SESSION PREVIEW (Same Height/Structure) */
            <Card className="bg-gradient-to-br from-blue-50 to-white border-blue-100 h-full shadow-sm">
              <CardHeader className="border-b border-blue-100/50">
                <div className="flex justify-between items-start">
                  <Badge className="bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-100">
                    Ad-Hoc Session
                  </Badge>
                  <Zap className="w-4 h-4 text-blue-400" />
                </div>
                <CardTitle className="text-2xl pt-2 text-blue-950">
                  {quickClientName || "New Client"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 pt-6">
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-blue-500" />
                  <div>
                    <p className="text-xs text-blue-400 uppercase font-bold">
                      Date
                    </p>
                    <p className="text-sm font-medium text-blue-900">
                      {new Date().toLocaleDateString(undefined, {
                        weekday: "long",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-white/60 border border-blue-100">
                  <p className="text-xs text-blue-400 uppercase font-bold tracking-widest">
                    Estimated Value
                  </p>
                  <p className="text-3xl text-zinc-300 font-light">---</p>
                  <p className="text-[10px] text-zinc-400 mt-1">
                    Calculated after room scope analysis
                  </p>
                </div>

                <div className="space-y-2 opacity-60">
                  <p className="text-xs text-blue-400 uppercase font-bold tracking-widest">
                    Scope Intelligence
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-2 py-1 bg-white border border-blue-100 rounded text-[11px] font-medium text-blue-600">
                      Auto-Detecting...
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
      <div className="">
        {/* <RoomIntelligenceCard subdomain={subdomain} /> */}
        <RoomList />
      </div>
      {/* Intelligence Card (Bottom) */}
    </div>
  );
}
