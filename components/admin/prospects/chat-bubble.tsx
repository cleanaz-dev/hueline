// chat-bubble.tsx
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Bot,
  UserRound,
  Headset,
  Mail,
  Phone,
  MessageSquare,
  Video,
  Calendar,
  Loader2,
  Activity,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ChatAttachments } from "./chat-attachments";
import { SystemActivityEvent } from "./system-activity-event";

type Role = "CLIENT" | "AI" | "OPERATOR" | "SYSTEM";
type Type = "SMS" | "EMAIL" | "PHONE" | "DEMO" | "MEETING" | "ACTIVITY";

interface ChatBubbleProps {
  msg: {
    id: string; 
    body: string;
    description?: string; 
    activityType?: string; 
    role: Role;
    type: Type;
    createdAt: Date | string;
    metadata?: any;
    mediaAttachments?: {
      id: string;
      filename: string;
      mimeType: string;
      mediaUrl: string;
      mediaSource: string;
      size: number;
    }[];
  };
  prospectName?: string;
  prospectId?: string;
  isPending?: boolean;
  isGroupStart?: boolean; 
  isGroupEnd?: boolean;
}

const ROLE_CONFIG = {
  CLIENT: {
    label: "Client",
    side: "right",
    bubble:
      "bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-700",
    icon: UserRound,
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
  PHONE: { icon: Phone, label: "Call Log" },
  DEMO: { icon: Video, label: "Demo" },
  MEETING: { icon: Calendar, label: "Meeting" },
  ACTIVITY: { icon: Activity, label: "Activity" },
};

export function ChatBubble({ 
  msg, 
  prospectName, 
  isPending, 
  prospectId,
  isGroupStart = true, 
  isGroupEnd = true 
}: ChatBubbleProps) {
  
  const time = new Date(msg.createdAt).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  if (msg.role === "SYSTEM") {
    return <SystemActivityEvent msg={msg} />;
  }

  const meta = ROLE_CONFIG[msg.role as keyof typeof ROLE_CONFIG];
  const isRight = meta.side === "right";
  const typeInfo = TYPE_CONFIG[msg.type];
  const TypeIcon = typeInfo.icon;

  const displayName = isRight ? (prospectName ?? "Client") : meta.label;

  return (
    <div
      className={cn(
        "flex w-full transition-all duration-300",
        isRight ? "justify-end" : "justify-start",
        isGroupEnd ? "mb-6" : "mb-2", // Tight gap for grouped, large gap for new senders
        isPending && "opacity-60",
      )}
    >
      <div
        className={cn(
          "flex max-w-[85%] md:max-w-[95%]", // Kept your original wide widths
          isRight ? "flex-row-reverse" : "flex-row",
        )}
      >
        {/* Avatar Column - Fixed width to keep bubbles aligned even if avatar is hidden */}
        <div className="flex flex-col items-center shrink-0 w-8 mx-3 mt-0.5">
          {isGroupStart && (
            <Avatar className="h-8 w-8 shadow-sm border border-zinc-200 dark:border-zinc-700">
              <AvatarFallback
                className={cn(
                  "bg-background",
                  msg.role === "AI" && "text-indigo-800 dark:text-indigo-400",
                  msg.role === "OPERATOR" && "text-blue-600 dark:text-blue-400",
                  msg.role === "CLIENT" && "text-zinc-600 dark:text-zinc-400",
                )}
              >
                <meta.icon size={16} />
              </AvatarFallback>
            </Avatar>
          )}
        </div>

        {/* Message Content */}
        <div
          className={cn(
            "flex flex-col gap-1.5 min-w-0",
            isRight ? "items-end" : "items-start",
          )}
        >
          {/* Header - Only show Name and Time on the first message of a group */}
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

          {/* Bubble - Kept your exact styling, borders, and inner labels */}
          <div
            className={cn(
              "relative flex flex-col px-4 py-3 rounded-2xl text-[14px] leading-relaxed shadow-sm break-words w-full",
              meta.bubble,
              // Tweak corners slightly to show grouping, but keep your heavy borders
              isRight 
                ? cn(isGroupStart ? "rounded-tr-sm" : "rounded-tr-xl") 
                : cn(isGroupStart ? "rounded-tl-sm" : "rounded-tl-xl")
            )}
          >
            {/* The inner label you wanted to keep */}
            <div className="flex items-center gap-1.5 pb-2 mb-2 border-b border-current/10 opacity-70">
              <TypeIcon size={14} strokeWidth={2.5} />
              <span className="text-[10px] uppercase tracking-widest font-bold">
                {typeInfo.label}
              </span>
            </div>

            {/* Attachments */}
            <ChatAttachments attachments={msg.mediaAttachments || []} prospectId={prospectId} />
            {/* Message Body */}
            <div className="whitespace-pre-wrap">{msg.body}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
