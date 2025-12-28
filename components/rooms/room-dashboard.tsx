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
import { Video, User, Phone, Target, ArrowRight } from "lucide-react";

export default function RoomsDashboard() {
  const [projectName, setProjectName] = useState("");
  const [selectedBookingId, setSelectedBookingId] = useState<string>("");
  const [isCreating, setIsCreating] = useState(false);
  const router = useRouter();
  const { subdomain } = useOwner();

  const selectedBooking = subdomain.bookings?.find(
    (b) => b.id === selectedBookingId
  );

  // Magic Auto-Name: Update room name whenever booking selection changes
  useEffect(() => {
    if (selectedBooking) {
      const today = new Date();
      const dateStr = `${String(today.getMonth() + 1).padStart(2, "0")}${String(
        today.getDate()
      ).padStart(2, "0")}${today.getFullYear()}`;
      const clientNameLower = selectedBooking.name
        .toLowerCase()
        .replace(/\s+/g, "");
      setProjectName(`${clientNameLower}-${dateStr}`);
    }
  }, [selectedBookingId, selectedBooking]);

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectName || !selectedBookingId || isCreating) return;

    setIsCreating(true);

    try {
      // Generate room ID: clientname-mmddyyyy-uuid
      const clientNameSlug = selectedBooking?.name
        .toLowerCase()
        .replace(/\s+/g, "");

      const today = new Date();
      const dateStr = `${String(today.getMonth() + 1).padStart(2, "0")}${String(
        today.getDate()
      ).padStart(2, "0")}${today.getFullYear()}`;

      const roomId = `${clientNameSlug}-${dateStr}-${uuidv4().slice(0, 4)}`;

      const response = await axios.post(
        `/api/subdomain/${subdomain.slug}/room/${roomId}`,
        {
          bookingId: selectedBookingId,
          roomName: projectName,
          clientName: selectedBooking?.name,
          clientPhone: selectedBooking?.phone,
        }
      );

      if (response.data) {
        router.push(`/my/rooms/${roomId}`);
      }
    } catch (error) {
      console.error("Error creating room:", error);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="container mx-auto max-w-6xl py-10 px-4 md:px-6 space-y-8  ">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight flex items-center gap-3">
            Live Rooms
          </h1>
          <p className="text-zinc-500 mt-2">
            Bridge the gap between a lead and a contract with a virtual
            walkthrough.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Left Column: Form (3/5) */}
        <form onSubmit={handleCreateRoom} className="lg:col-span-3 space-y-6">
          <Card className="border-zinc-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl">1. Select Project</CardTitle>
              <CardDescription>
                Which client are we meeting today?
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="booking-select" className="text-zinc-700">
                  Active Bookings
                </Label>
                <Select
                  value={selectedBookingId}
                  onValueChange={setSelectedBookingId}
                >
                  <SelectTrigger
                    id="booking-select"
                    className="h-12 border-zinc-300"
                  >
                    <SelectValue placeholder="Search bookings..." />
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
                <Label htmlFor="room-name" className="text-zinc-700">
                  Room Title
                </Label>
                <div className="relative">
                  <Input
                    id="room-name"
                    className=" border-zinc-300 pr-10"
                    placeholder="e.g. Living Room & Kitchen Details"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Button
            type="submit"
            size="lg"
            className="w-full  text-lg font-bold shadow-lg transition-all"
            disabled={isCreating || !projectName || !selectedBookingId}
          >
            {isCreating ? "Initializing Room..." : "Launch Virtual Walkthrough"}
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </form>

        {/* Right Column: Project Briefing (2/5) */}
        <div className="lg:col-span-2">
          {selectedBooking ? (
            <Card className="bg-card text-foreground border-none sticky top-6">
              <CardHeader className="border-b border-white/10">
                <div className="flex justify-between items-start">
                  <Badge className=" text-white border-cyan-500/20">
                    Project Brief
                  </Badge>
                  <span className="text-primary text-xs font-mono">
                    {selectedBooking.huelineId}
                  </span>
                </div>
                <CardTitle className="text-2xl pt-2">
                  {selectedBooking.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 -mt-6">
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-primary" />

                  <div>
                    <p className="text-xs text-zinc-500 uppercase">Contact</p>
                    <p className="text-sm font-medium">
                      {selectedBooking.phone}
                    </p>
                  </div>
                </div>

                {selectedBooking.projectType && (
                  <div className="flex items-center gap-3">
                    <Target className="w-5 h-5 text-primary" />

                    <div>
                      <p className="text-xs text-zinc-500 uppercase">Focus</p>
                      <p className="text-sm font-medium">
                        {selectedBooking.projectType}
                      </p>
                    </div>
                  </div>
                )}

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
                            className="px-2 py-1  rounded text-[11px] font-medium text-primary"
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
            <div className="h-full border-2 bg-muted border-dashed border-zinc-200 rounded-3xl flex flex-col items-center justify-center p-8 text-center text-zinc-400">
              <User className="w-12 h-12 mb-4 opacity-20" />
              <p className="text-sm">
                Select a project to view the client briefing here.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
