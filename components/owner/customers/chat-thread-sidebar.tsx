"use client";

import { useState, useEffect } from "react";
import {
  Clock,
  Image as ImageIcon,
  Mail,
  Bot,
  ArrowRight,
  Activity,
  Phone,
  UserRound,
  Headset,
  MessageSquare,
  Video,
  Calendar,
  CheckCircle,
  FileText,
} from "lucide-react";
import { ChatThread as PrismaChatThread, Quote } from "@/app/generated/prisma";
import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";
import { useOwner } from "@/context/owner-context";
import { cn } from "@/lib/utils";
import { SideBarQuoteSummary } from "../quote/sidebar-quote-summary";

export type EnrichedChatThread = PrismaChatThread & {
  activities: { type: string; createdAt: string | Date }[];
  communications: {
    body: string;
    role: string;
    type: string;
    createdAt: string | Date;
    subject?: string;
    metadata?: any; 
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

// UPGRADED: Added a maxLength parameter (defaults to 120 chars)
function stripAndTruncateHtml(html: string, maxLength: number = 120) {
  if (!html) return "";
  // Strip tags and decode basic HTML entities for a clean snippet
  let text = html.replace(/<[^>]*>/g, " ");
  text = text
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
    
  const cleanText = text.replace(/\s+/g, " ").trim();
  
  if (cleanText.length <= maxLength) return cleanText;
  return cleanText.substring(0, maxLength).trimEnd() + "...";
}

function getRoleInfo(role: string) {
  switch (role) {
    case "AI":
      return {
        label: "AI Assistant",
        bubbleClass: "bg-indigo-50 text-indigo-900 border border-indigo-100",
        icon: Bot,
        side: "left",
      };
    case "OPERATOR":
      return {
        label: "Team Member",
        bubbleClass: "bg-blue-50 text-blue-900 border border-blue-100",
        icon: Headset,
        side: "left",
      };
    case "CUSTOMER":
    case "CLIENT":
      return {
        label: "Customer",
        bubbleClass: "bg-zinc-100 text-zinc-900 border border-zinc-200",
        icon: UserRound,
        side: "right",
      };
    default:
      return {
        label: "System",
        bubbleClass: "bg-slate-50 text-slate-600 border border-slate-200",
        icon: Activity,
        side: "center",
      };
  }
}

function getTypeInfo(type: string) {
  switch (type) {
    case "SMS":
      return { icon: MessageSquare, label: "SMS" };
    case "EMAIL":
      return { icon: Mail, label: "Email" };
    case "PHONE":
      return { icon: Phone, label: "Call Log" };
    case "DEMO":
      return { icon: Video, label: "Demo" };
    case "MEETING":
      return { icon: Calendar, label: "Meeting" };
    default:
      return { icon: Activity, label: "Activity" };
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
  customerQuote,
}: {
  threads: EnrichedChatThread[];
  callsCount: number;
  customerName: string;
  customerPhone?: string;
  customerEmail?: string;
  customerQuote?: Quote;
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
      {/* External Title Row */}
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

      <div className="bg-white rounded-[24px] shadow-sm border border-slate-200 flex-1 flex flex-col overflow-hidden min-h-0">
        {/* ---- TABS SECTION ---- */}
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

        {/* ---- CONTENT AREA ---- */}
        <div className="flex-1 overflow-y-auto min-h-0 bg-white p-6">
          {activeThread ? (
            <>
              {/* Thread Header Info */}
              {(() => {
                return (
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h3 className="text-lg font-bold text-muted-foreground mb-1">
                        {activeThread.title}
                      </h3>
                    </div>
                    <span className="px-2.5 py-1 bg-slate-50 border border-slate-200 text-slate-600 text-[10px] font-bold uppercase tracking-wider rounded-md shrink-0">
                      {activeThread.status}
                    </span>
                  </div>
                );
              })()}

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
                const typeInfo = getTypeInfo(lastMsg.type);
                const isRight = roleInfo.side === "right";

                const senderName = isRight
                  ? customerName || "Customer"
                  : roleInfo.label;
                const receiverName = isRight
                  ? "Team"
                  : customerName || "Customer";
                const emailSubject =
                  lastMsg.subject || lastMsg.metadata?.subject;

                return (
                  <div className="mb-8">
                    {/* Clear direction header to stop confusion */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2 bg-slate-50 px-2.5 py-1 rounded-md border border-slate-100 text-[11px] font-bold text-slate-500">
                        <span className={cn(isRight && "text-slate-800")}>
                          {senderName}
                        </span>
                        <ArrowRight className="w-3 h-3 text-slate-300" />
                        <span className={cn(!isRight && "text-slate-800")}>
                          {receiverName}
                        </span>
                      </div>
                      <span className="text-xs font-medium text-slate-400">
                        {formatDistanceToNow(new Date(lastMsg.createdAt), {
                          addSuffix: true,
                        })}
                      </span>
                    </div>

                    {/* Omni Chat Bubble Design Preview */}
                    <div
                      className={cn(
                        "flex w-full",
                        isRight ? "justify-end" : "justify-start",
                      )}
                    >
                      <div
                        className={cn(
                          "relative flex flex-col px-4 py-3 rounded-2xl text-[13px] shadow-sm break-words w-[90%]",
                          roleInfo.bubbleClass,
                          isRight ? "rounded-tr-sm" : "rounded-tl-sm",
                        )}
                      >
                        {/* Inner Type Label */}
                        <div className="flex items-center gap-1.5 pb-2 mb-2 border-b border-current/10 opacity-70">
                          <typeInfo.icon size={14} strokeWidth={2.5} />
                          <span className="text-[10px] uppercase tracking-widest font-bold">
                            {typeInfo.label}
                          </span>
                        </div>

                        {/* Clean Email Formatting */}
                        {lastMsg.type === "EMAIL" && (
                          <div className="mb-2 pb-2 border-b border-current/10 flex flex-col gap-0.5">
                            <span className="text-[9px] uppercase tracking-wider font-bold opacity-50">
                              Subject
                            </span>
                            <span
                              className={cn(
                                "font-medium leading-snug truncate",
                                !emailSubject && "italic opacity-60",
                              )}
                            >
                              {emailSubject || "No subject"}
                            </span>
                          </div>
                        )}

                        {/* Message Snippet Wrapper 
                            UPGRADED: Swapped to line-clamp-2, normal whitespace, and max char length! 
                        */}
                        <div className="line-clamp-2 leading-relaxed opacity-90">
                          {stripAndTruncateHtml(lastMsg.body, 120)}
                        </div>
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

                {/* ---- RENDER REDESIGNED QUOTE COMPONENT ---- */}
                <SideBarQuoteSummary
                  customerQuote={customerQuote}
                  customerName={customerName}
                />
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
                  isAutoPilot: activeThread.isAutoPilot,
                  shortId: activeThread.shortId
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