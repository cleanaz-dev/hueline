"use client";

import { useState, useEffect } from "react";
import {
  Clock,
  MessageSquare,
  Image as ImageIcon,
  Mail,
  Smartphone,
  Bot,
  User,
  ArrowRight,
  UserCircle,
  Activity,
  Phone,
} from "lucide-react";
import { ChatThread as PrismaChatThread } from "@/app/generated/prisma";
import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";
import { useOwner } from "@/context/owner-context";

export type EnrichedChatThread = PrismaChatThread & {
  activities: { type: string; createdAt: string | Date }[];
  communications: {
    body: string;
    role: string;
    type: string;
    createdAt: string | Date;
  }[];
};

// ----------------------------------------------------------------------
// Helpers
// ----------------------------------------------------------------------
function getLastMessage(comms: EnrichedChatThread["communications"]) {
  if (!comms || comms.length === 0) return null;
  return [...comms].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  )[0];
}

function stripHtml(html: string) {
  return html.replace(/<[^>]*>/g, "").trim();
}

function truncate(str: string, len: number) {
  return str.length > len ? str.slice(0, len) + "…" : str;
}

function getRoleInfo(role: string) {
  switch (role) {
    case "AI":
      return {
        label: "AI Assistant",
        icon: <Bot className="w-4 h-4" />,
        color: "text-violet-600 bg-violet-50 border-violet-100",
      };
    case "OPERATOR":
      return {
        label: "Team Member",
        icon: <User className="w-4 h-4" />,
        color: "text-[#007AFF] bg-[#007AFF]/10 border-[#007AFF]/20",
      };
    case "CUSTOMER":
      return {
        label: "Customer",
        icon: <UserCircle className="w-4 h-4" />,
        color: "text-emerald-600 bg-emerald-50 border-emerald-100",
      };
    default:
      return {
        label: "System",
        icon: <Activity className="w-4 h-4" />,
        color: "text-slate-600 bg-slate-50 border-slate-200",
      };
  }
}

function getChannelInfo(type: string) {
  switch (type) {
    case "SMS":
      return { label: "via SMS", icon: <Smartphone className="w-3.5 h-3.5" /> };
    case "EMAIL":
      return { label: "via Email", icon: <Mail className="w-3.5 h-3.5" /> };
    default:
      return {
        label: "via System",
        icon: <MessageSquare className="w-3.5 h-3.5" />,
      };
  }
}

// ----------------------------------------------------------------------
// ChatThreadsSidebar
// ----------------------------------------------------------------------
export default function ChatThreadsSidebar({
  threads,
  callsCount,
  customerName,
  customerPhone,
  customerEmail,
}: {
  threads: EnrichedChatThread[];
  callsCount: number;
  customerName: string;
  customerPhone?: string;
  customerEmail?: string;
}) {
  const [activeTabId, setActiveTabId] = useState<string | null>(null);
  const { openChat } = useOwner();

  useEffect(() => {
    if (threads.length > 0 && !activeTabId) {
      setActiveTabId(threads[0].id);
    }
  }, [threads, activeTabId]);

  const activeThread = threads.find((t) => t.id === activeTabId) || threads[0];

  return (
    <div className="h-[685px] flex flex-col space-y-4 min-h-0">
      {/* External Title Row (fixed height) */}
      <div className="flex items-center gap-2 px-1 shrink-0">
        <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
          Recent Threads
        </h2>
        {threads.length > 0 && (
          <span className="bg-white text-gray-600 px-2 py-0.5 rounded-[24px] text-[10px] font-bold shadow-sm border border-gray-200">
            {threads.length}
          </span>
        )}
      </div>

      {/* Main Unified Component */}

      <div className="bg-white rounded-[24px] shadow-sm border border-slate-200 flex-1 flex flex-col overflow-hidden min-h-0">
        {/* ---- TABS SECTION (fixed height) ---- */}
        {threads.length > 1 && (
          <div className="flex overflow-x-auto border-b border-slate-100 shrink-0 px-2 pt-2 scrollbar-hide">
            {threads.map((thread) => {
              const isActive = thread.id === activeTabId;
              return (
                <button
                  key={thread.id}
                  onClick={() => setActiveTabId(thread.id)}
                  className={`px-4 py-3 text-sm font-bold transition-all border-b-2 whitespace-nowrap flex items-center gap-2
                    ${
                      isActive
                        ? "border-[#007AFF] text-[#007AFF]"
                        : "border-transparent text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-t-xl"
                    }`}
                >
                  {thread.title}
                  {thread.communications.length > 0 && (
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${isActive ? "bg-[#007AFF]" : "bg-slate-300"}`}
                    />
                  )}
                </button>
              );
            })}
          </div>
        )}

        {/* ---- TAB SCROLLABLE CONTENT AREA ---- */}
        {/* THE FIX: `flex-1 overflow-y-auto min-h-0` ensures THIS is the only part that scrolls and stops expanding */}
        <div className="flex-1 overflow-y-auto min-h-0 bg-white p-6">
          {activeThread ? (
            <>
              {/* Thread Header Info */}
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 mb-1">
                    {activeThread.title}
                  </h3>
                  <div className="flex items-center gap-1.5 text-xs font-medium text-slate-400">
                    <Clock className="w-3.5 h-3.5" />
                    Updated{" "}
                    {formatDistanceToNow(new Date(activeThread.updatedAt), {
                      addSuffix: true,
                    })}
                  </div>
                </div>
                <span className="px-2.5 py-1 bg-slate-50 border border-slate-200 text-slate-600 text-[10px] font-bold uppercase tracking-wider rounded-md shrink-0">
                  {activeThread.status}
                </span>
              </div>

              {/* Latest Message Breakdown */}
              {(() => {
                const lastMsg = getLastMessage(activeThread.communications);
                if (!lastMsg)
                  return (
                    <div className="bg-slate-50 rounded-xl p-4 text-center text-sm text-slate-500 border border-slate-100 mb-6">
                      No messages in this thread yet.
                    </div>
                  );

                const roleInfo = getRoleInfo(lastMsg.role);
                const channelInfo = getChannelInfo(lastMsg.type);

                return (
                  <div className="mb-8">
                    <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-3">
                      Last Communication
                    </h4>

                    <div className="bg-white border border-slate-200 shadow-sm rounded-2xl overflow-hidden">
                      <div className="bg-slate-50/50 border-b border-slate-100 px-4 py-3 flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`p-1.5 rounded-lg border ${roleInfo.color}`}
                          >
                            {roleInfo.icon}
                          </div>
                          <div>
                            <div className="text-sm font-bold text-slate-900 leading-none mb-1">
                              {roleInfo.label}
                            </div>
                            <div className="flex items-center gap-1 text-[11px] font-medium text-slate-500 mt-1">
                              {channelInfo.icon}
                              {channelInfo.label}
                            </div>
                          </div>
                        </div>
                        <div className="text-xs text-slate-400 font-medium">
                          {formatDistanceToNow(new Date(lastMsg.createdAt), {
                            addSuffix: true,
                          })}
                        </div>
                      </div>
                      <div className="p-4 bg-white text-sm text-slate-600 leading-relaxed">
                        {truncate(
                          lastMsg.type === "EMAIL"
                            ? stripHtml(lastMsg.body)
                            : lastMsg.body,
                          160,
                        )}
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Organized Stats Grid */}
              <div className="mb-2">
                <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-3">
                  Activity Overview
                </h4>
                <div className="grid grid-cols-4 gap-3">
                  <div className="bg-violet-50 rounded-2xl p-4 border border-violet-100/50 flex flex-col items-center justify-center text-center hover:shadow-sm transition-all">
                    <ImageIcon className="w-5 h-5 text-violet-500 mb-2" />
                    <span className="text-xl font-black text-violet-700 leading-none mb-1">
                      {
                        activeThread.activities.filter(
                          (a) => a.type === "GENERATED_IMAGE",
                        ).length
                      }
                    </span>
                    <span className="text-[10px] font-bold text-violet-600 uppercase tracking-wider opacity-80">
                      Images
                    </span>
                  </div>

                  <div className="bg-orange-50 rounded-2xl p-4 border border-orange-100/50 flex flex-col items-center justify-center text-center hover:shadow-sm transition-all">
                    <Mail className="w-5 h-5 text-orange-500 mb-2" />
                    <span className="text-xl font-black text-orange-700 leading-none mb-1">
                      {
                        activeThread.activities.filter(
                          (a) => a.type === "EMAIL_SENT",
                        ).length
                      }
                    </span>
                    <span className="text-[10px] font-bold text-orange-600 uppercase tracking-wider opacity-80">
                      Emails
                    </span>
                  </div>

                  <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/50 flex flex-col items-center justify-center text-center hover:shadow-sm transition-all">
                    <MessageSquare className="w-5 h-5 text-slate-400 mb-2" />
                    <span className="text-xl font-black text-slate-700 leading-none mb-1">
                      {activeThread.communications.length}
                    </span>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider opacity-80">
                      Messages
                    </span>
                  </div>

                  <div className="bg-sky-50 rounded-2xl p-4 border border-sky-100/50 flex flex-col items-center justify-center text-center hover:shadow-sm transition-all">
                    <Phone className="w-5 h-5 text-sky-500 mb-2" />
                    <span className="text-xl font-black text-sky-700 leading-none mb-1">
                      {callsCount}
                    </span>
                    <span className="text-[10px] font-bold text-sky-600 uppercase tracking-wider opacity-80">
                      Calls
                    </span>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center m-auto min-h-[200px]">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 border border-slate-100">
                <MessageSquare className="w-8 h-8 text-slate-300" />
              </div>
              <p className="text-base font-bold text-slate-900">
                No active threads
              </p>
              <p className="text-sm text-slate-500 mt-2 max-w-[240px] leading-relaxed">
                When communications begin, they will be organized here.
              </p>
            </div>
          )}
        </div>

        {/* ---- FIXED FOOTER ---- */}
        {/* Pushed outside the scroll area so it always stays locked at the bottom of the white box! */}
        {activeThread && (
          <div className="shrink-0 p-6 pt-4 border-t border-slate-100 bg-white mt-auto">
            <Button
              className="w-full flex items-center gap-2"
              size="xl"
              variant="ghost"
              onClick={() => {
                if (!activeThread) return;
                openChat({
                  id: activeThread.customerId,
                  name: customerName,
                  phone: customerPhone,
                  email: customerEmail,
                  threadId: activeThread.id,
                });
              }}
            >
              Open Full Conversation
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
