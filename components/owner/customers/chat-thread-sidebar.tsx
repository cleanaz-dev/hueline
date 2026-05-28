"use client"

import React from "react"
import Link from "next/link"
import { Clock, MessageSquare } from "lucide-react"

// ----------------------------------------------------------------------
// Types
// ----------------------------------------------------------------------
export type ChatThread = {
  id: string
  title: string
  status: string
  updatedAt: string
}

// ----------------------------------------------------------------------
// Helpers
// ----------------------------------------------------------------------
const formatDate = (dateString: string) =>
  new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(dateString))

// ----------------------------------------------------------------------
// ChatThreadsSidebar
// ----------------------------------------------------------------------
export default function ChatThreadsSidebar({ threads }: { threads: ChatThread[] }) {
  return (
    <div className="lg:col-span-1 space-y-5">
      <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider px-1">
        Recent Threads
      </h2>

      <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 p-5">
        <div className="space-y-3">
          {threads.map((thread) => (
            <Link
              href={`/dashboard/chats/${thread.id}`}
              key={thread.id}
              className="group block p-4 bg-gray-50/50 border border-gray-100 rounded-xl hover:border-[#007AFF]/20 hover:bg-[#007AFF]/5 transition-all"
            >
              <div className="flex items-start justify-between mb-2">
                <h5 className="font-bold text-xs text-gray-900 group-hover:text-[#007AFF] transition-colors pr-2">
                  {thread.title}
                </h5>
                <span className="px-1.5 py-0.5 bg-gray-200 text-gray-600 text-[9px] font-bold uppercase tracking-wider rounded shrink-0">
                  {thread.status}
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                <Clock className="w-3 h-3" />
                {formatDate(thread.updatedAt)}
              </div>
            </Link>
          ))}

          {threads.length === 0 && (
            <div className="text-center py-6">
              <MessageSquare className="w-6 h-6 text-gray-300 mx-auto mb-2" />
              <p className="text-xs font-medium text-gray-400">No active chats</p>
            </div>
          )}
        </div>

        {threads.length > 0 && (
          <Link
            href="/dashboard/chats"
            className="block w-full text-center mt-4 py-2 text-xs font-bold uppercase tracking-wider text-gray-500 hover:text-gray-900 transition-colors"
          >
            View All Messages
          </Link>
        )}
      </div>
    </div>
  )
}