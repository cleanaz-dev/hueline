"use client";

import { Phone, Mail, Clock, CheckCircle2 } from "lucide-react";

import BookingCard, { Booking, Call } from "./booking-card";
import ChatThreadsSidebar, { EnrichedChatThread } from "./chat-thread-sidebar";
import DesignProjectsBar, { DesignProject } from "./design-projects-bar";
import { Quote } from "@/app/generated/prisma/wasm";

// ----------------------------------------------------------------------
// Types & Sanitization
// ----------------------------------------------------------------------
type NonNullCustomerData = any; // Replace with your actual Prisma type

const sanitizeCustomer = (customer: NonNullCustomerData) => ({
  ...customer,
  name: customer.name ?? "Unknown Customer",
  email: customer.email ?? "No email provided",
  phone: customer.phone ?? "No phone number",
  status: customer.status ?? "PENDING",
  customerType: customer.customerType ?? "Residential",
  createdAt: customer.createdAt ?? new Date().toISOString(),
  subBookingData: (customer.subBookingData ?? []) as Booking[],
  calls: (customer.calls ?? []) as Call[],
  chatThreads: (customer.chatThreads ?? []) as EnrichedChatThread[],
  designProjects: (customer.designProjects ?? []) as DesignProject[],
  customerQuote: (customer.subBookingData?.[0]?.quotes?.[0] ??
    null) as Quote | null,
});
// ----------------------------------------------------------------------
// StatusBadge
// ----------------------------------------------------------------------
const StatusBadge = ({ status }: { status: string }) => {
  const isPending = status.toUpperCase() === "PENDING";
  return (
    <div
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider border ${
        isPending
          ? "bg-[#FFF8F3] text-[#E06D24] border-[#FDE1D3]"
          : "bg-emerald-50 text-emerald-600 border-emerald-100"
      }`}
    >
      {isPending ? (
        <Clock className="w-3.5 h-3.5" />
      ) : (
        <CheckCircle2 className="w-3.5 h-3.5" />
      )}
      <span>{status}</span>
    </div>
  );
};

// ----------------------------------------------------------------------
// Page
// ----------------------------------------------------------------------
export default function CustomerSinglePage({
  customer,
}: {
  customer: NonNullCustomerData;
}) {
  if (!customer) return null;

  const data = sanitizeCustomer(customer);

  return (
    <div className="flex flex-col gap-6 w-full animate-in fade-in duration-500">
      {/* 1. Client bar */}
      <div className="bg-white rounded-[20px] shadow-sm border border-gray-100 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-gray-900 text-white flex items-center justify-center font-bold text-lg shadow-sm shrink-0">
            {data.name.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-xl font-bold text-gray-900 leading-none">
                {data.name}
              </h1>
              <span className="px-2 py-0.5 bg-gray-100 text-gray-500 text-[10px] font-bold uppercase tracking-wider rounded">
                {data.customerType}
              </span>
            </div>
            <div className="flex items-center gap-4 text-xs font-medium text-gray-500">
              <span className="flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5" /> {data.email}
              </span>
              <span className="flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5" /> {data.phone}
              </span>
            </div>
          </div>
        </div>
        <StatusBadge status={data.status} />
      </div>

      {/* 2 & 3. Middle grid: 2-Column Main Area + 1-Column Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT MAIN AREA (Spans 2 cols) - Contains Bookings AND Design Projects */}
        <div className="lg:col-span-2 flex flex-col gap-8">
          {/* Bookings */}
          <div className="space-y-4">
            <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider px-1">
              Booking Requests
            </h2>

            {data.subBookingData.length > 0 ? (
              data.subBookingData.map((booking: Booking, idx: number) => {
                const mappedCalls = data.calls.filter(
                  (c: Call) => c.bookingDataId === booking.id,
                );
                if (idx === 0) {
                  const unassignedCalls = data.calls.filter(
                    (c: Call) => !c.bookingDataId,
                  );
                  mappedCalls.push(...unassignedCalls);
                }

                return (
                  <BookingCard
                    key={booking.id}
                    booking={booking}
                    calls={mappedCalls}
                  />
                );
              })
            ) : (
              <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 p-12 text-center flex flex-col items-center">
                <p className="text-gray-500 font-medium text-sm">
                  No visualizations requested yet.
                </p>
              </div>
            )}
          </div>

          {/* Design Projects */}
          <DesignProjectsBar projects={data.designProjects} />
        </div>

        {/* RIGHT SIDEBAR - Chat threads */}
        {/* THE FIX: Added `h-full min-h-0 flex flex-col` so it is forced to lock to the grid height */}
        <div className="h-full min-h-0 flex flex-col">
          <ChatThreadsSidebar
            threads={data.chatThreads}
            callsCount={data.calls.length}
            customerName={data.name}
            customerPhone={data.phone}
            customerEmail={data.email}
            customerQuote={data.customerQuote} // was data.quotes — wrong key, wrong shape
          />
        </div>
      </div>
    </div>
  );
}
