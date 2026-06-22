// chat-bubble.tsx
import {
  Bot,
  Headset,
  Mail,
  Phone,
  MessageSquare,
  Video,
  Calendar,
  Loader2,
  Activity,
  Receipt,
  PersonStanding,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { OwnerChatAttachments } from "./owner-chat-attachements";
import { SystemActivityEvent } from "../admin/prospects/system-activity-event";

// Omnichannel formatting
import Markdown from "react-markdown";
import DOMPurify from "dompurify";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import ThreadQuoteCard from "./quote/thread-quote-card";
import { Type, ChatBubbleProps, Role } from "@/types/chat-types";
import ThreadCallCard from "./chat-widget/thread-call-card";

const ROLE_CONFIG = {
  CLIENT: {
    label: "Client",
    side: "right",
    bubble:
      "bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-700",
    icon: PersonStanding,
  },
  AI: {
    label: "AI Assistant",
    side: "left",
    bubble:
      "bg-indigo-50 dark:bg-indigo-500/10 text-indigo-900 dark:text-indigo-200 border border-indigo-100 dark:border-indigo-500/20",
    icon: Bot,
  },
  OPERATOR: {
    label: "Operator",
    side: "left",
    bubble:
      "bg-blue-50 dark:bg-blue-500/10 text-blue-900 dark:text-blue-200 border border-blue-100 dark:border-blue-500/20",
    icon: Headset,
  },
};

const TYPE_CONFIG: Record<Type, { icon: any; label: string }> = {
  SMS: { icon: MessageSquare, label: "SMS" },
  EMAIL: { icon: Mail, label: "Email" },
  PHONE: { icon: Phone, label: "Call" },
  DEMO: { icon: Video, label: "Demo" },
  MEETING: { icon: Calendar, label: "Meeting" },
  ACTIVITY: { icon: Activity, label: "Activity" },
  QUOTE: { icon: Receipt, label: "Quote" },
};

// Helper function to detect if string contains HTML tags
const containsHTML = (str: string) => /<[a-z][\s\S]*>/i.test(str);

export function OwnerChatBubble({
  msg,
  huelineId,
  prospectName,
  isPending,
  prospectId,
  isGroupStart = true,
  isGroupEnd = true,
  onCancelFollowUp,
}: ChatBubbleProps) {
  const time = new Date(msg.createdAt).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  if (msg.role === "SYSTEM") {
    return <SystemActivityEvent msg={msg} onCancelFollowUp={onCancelFollowUp} />
  }

  const meta = ROLE_CONFIG[msg.role as keyof typeof ROLE_CONFIG];
  const isRight = meta.side === "right";
  const typeInfo = TYPE_CONFIG[msg.type];
  const TypeIcon = typeInfo.icon;

  const displayName = isRight ? (prospectName ?? "Client") : meta.label;
  const emailSubject = msg.subject || msg.metadata?.subject;

  return (
    <div
      className={cn(
        "flex w-full transition-all duration-300",
        isRight ? "justify-end" : "justify-start",
        isGroupEnd ? "mb-6" : "mb-2",
        isPending && "opacity-60",
      )}
    >
      <div
        className={cn(
          "flex max-w-[85%] md:max-w-[95%]",
          isRight ? "flex-row-reverse" : "flex-row",
        )}
      >
        {/* Avatar Column */}
        <div className="flex flex-col items-center shrink-0 w-8 mx-3 ">
          {isGroupStart && (
            <div
              className={cn(
                "bg-background",
                msg.role === "AI" && "text-indigo-600",
                msg.role === "OPERATOR" && "text-blue-600",
                msg.role === "CLIENT" && "text-zinc-600",
              )}
            >
              <meta.icon size={16} />
            </div>
          )}
        </div>

        {/* Message Content */}
        <div
          className={cn(
            "flex flex-col gap-1.5 min-w-0",
            isRight ? "items-end" : "items-start",
          )}
        >
          {/* Header */}
          {isGroupStart && (
            <div className="flex items-baseline gap-2 px-1">
              <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                {displayName}
              </span>
              {isPending ? (
                <span className="flex items-center gap-1 text-[10px] font-medium text-blue-500 animate-pulse">
                  <Loader2 size={10} className="animate-spin" /> Sending...
                </span>
              ) : (
                <span className="text-[10px] font-medium text-zinc-400 dark:text-zinc-500">
                  {time}
                </span>
              )}
            </div>
          )}

          {/* Bubble */}
          <div
            className={cn(
              "relative flex flex-col px-4 py-3 rounded-2xl text-[14.5px] shadow-sm break-words w-full",
              meta.bubble,
              isRight
                ? cn(isGroupStart ? "rounded-tr-sm" : "rounded-tr-xl")
                : cn(isGroupStart ? "rounded-tl-sm" : "rounded-tl-xl"),
            )}
          >
            {/* Inner Label */}
            <div className="flex items-center gap-1.5 pb-2 mb-2 border-b border-current/10 opacity-70">
              <TypeIcon size={14} strokeWidth={2.5} />
              <span className="text-[10px] uppercase tracking-widest font-bold">
                {typeInfo.label}
              </span>
            </div>

            {/* Attachments */}
            <OwnerChatAttachments
              attachments={msg.mediaAttachments || []}
              prospectId={prospectId}
            />

            {/* NEW CLEANER: Email Subject Line */}
            {msg.type === "EMAIL" && (
              <div className="mb-3 pb-3 border-b border-current/10 flex flex-col gap-1">
                <span className="text-[10px] uppercase tracking-wider font-bold opacity-50">
                  Subject
                </span>
                <span
                  className={cn(
                    "font-medium leading-snug",
                    !emailSubject && "italic opacity-60",
                  )}
                >
                  {emailSubject || "No subject"}
                </span>
              </div>
            )}

            {/* Message Body */}
            {msg.type === "QUOTE" && msg.metadata?.quoteId ? (
              <ThreadQuoteCard msg={msg} />
            ) : msg.type === "PHONE" ? (
              // NEW: Render the Call Card!
              <ThreadCallCard msg={msg} />
            ) : msg.type === "EMAIL" ? (
              // Existing Email render logic
              <div className="flex flex-col text-[14px] leading-relaxed opacity-90 [&_p]:mb-3 last:[&_p]:mb-0 [&_a]:underline [&_a]:font-medium hover:[&_a]:opacity-80 [&_ul]:list-disc [&_ul]:ml-5 [&_ol]:list-decimal [&_ol]:ml-5">
                {containsHTML(msg.body) ? (
                  <div
                    dangerouslySetInnerHTML={{
                      __html: DOMPurify.sanitize(msg.body),
                    }}
                  />
                ) : (
                  <Markdown remarkPlugins={[remarkGfm, remarkBreaks]}>
                    {msg.body}
                  </Markdown>
                )}
              </div>
            ) : (
              // Existing Standard render logic
              <div className="whitespace-pre-wrap leading-relaxed opacity-90">
                {msg.body}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
