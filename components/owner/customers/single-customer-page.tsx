"use client"

import { Phone, Mail, Clock, CheckCircle2 } from "lucide-react"

import BookingCard, { Booking } from "./booking-card"
import ChatThreadsSidebar, { ChatThread } from "./chat-thread-sidebar"
import DesignProjectsBar, { DesignProject } from "./design-projects-bar"

// ----------------------------------------------------------------------
// Types & Sanitization
// ----------------------------------------------------------------------
type NonNullCustomerData = any // Replace with your actual Prisma type

const sanitizeCustomer = (customer: NonNullCustomerData) => ({
  ...customer,
  name: customer.name ?? "Unknown Customer",
  email: customer.email ?? "No email provided",
  phone: customer.phone ?? "No phone number",
  status: customer.status ?? "PENDING",
  customerType: customer.customerType ?? "Residential",
  createdAt: customer.createdAt ?? new Date().toISOString(),
  subBookingData: (customer.subBookingData ?? []) as Booking[],
  calls: customer.calls ?? [],
  chatThreads: (customer.chatThreads ?? []) as ChatThread[],
  designProjects: (customer.designProjects ?? []) as DesignProject[],
})

// ----------------------------------------------------------------------
// StatusBadge (stays here — only used by this page)
// ----------------------------------------------------------------------
const StatusBadge = ({ status }: { status: string }) => {
  const isPending = status.toUpperCase() === "PENDING"
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
  )
}

// ----------------------------------------------------------------------
// Page
// ----------------------------------------------------------------------
export default function CustomerSinglePage({
  customer,
}: {
  customer: NonNullCustomerData
}) {
  if (!customer) return null

  const data = sanitizeCustomer(customer)

  return (
    <div className="space-y-6 w-full animate-in fade-in duration-500">

      {/* 1. Client bar */}
      <div className="bg-white rounded-[20px] shadow-sm border border-gray-100 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-gray-900 text-white flex items-center justify-center font-bold text-lg shadow-sm shrink-0">
            {data.name.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-xl font-bold text-gray-900 leading-none">{data.name}</h1>
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

      {/* 2 & 3. Middle grid: Bookings + Threads sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Bookings */}
        <div className="lg:col-span-2 space-y-5">
          <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider px-1">
            Booking Requests
          </h2>

          {data.subBookingData.length > 0 ? (
            data.subBookingData.map((booking: Booking) => (
              <BookingCard key={booking.id} booking={booking} />
            ))
          ) : (
            <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 p-12 text-center flex flex-col items-center">
              <p className="text-gray-500 font-medium text-sm">
                No visualizations requested yet.
              </p>
            </div>
          )}
        </div>

        {/* Chat threads sidebar */}
        <ChatThreadsSidebar threads={data.chatThreads} />
      </div>

      {/* 4. Design projects bottom bar */}
      <DesignProjectsBar projects={data.designProjects} />

    </div>
  )
}