// chat-bubble.tsx
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  Bot, UserRound, Headset, Mail, Phone, MessageSquare, Video, Calendar, Loader2 
} from "lucide-react";
import { cn } from "@/lib/utils";
import { InteractiveChatImage } from "./interactive-chat-image";

type Role = "CLIENT" | "AI" | "OPERATOR";
type Type = "SMS" | "EMAIL" | "PHONE" | "DEMO" | "MEETING";

interface ChatBubbleProps {
  msg: {
    body: string;
    role: Role;
    type: Type;
    createdAt: Date | string;
    mediaUrl?: string | null;
  };
  prospectName?: string;
  isPending?: boolean; // <-- NEW PROP
}

const ROLE_CONFIG = {
  CLIENT: {
    label: "Client",
    side: "right",
    bubble: "bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-700",
    icon: UserRound,
  },
  AI: {
    label: "AI Assistant",
    side: "left",
    bubble: "bg-indigo-50 dark:bg-indigo-500/10 text-indigo-900 dark:text-indigo-200 border border-indigo-100 dark:border-indigo-500/20",
    icon: Bot,
  },
  OPERATOR: {
    label: "Operator",
    side: "left", // We'll keep operator on the left, or you can switch it to 'right' if you prefer!
    bubble: "bg-blue-50 dark:bg-blue-500/10 text-blue-900 dark:text-blue-200 border border-blue-100 dark:border-blue-500/20",
    icon: Headset,
  },
};

const TYPE_CONFIG: Record<Type, { icon: any; label: string }> = {
  SMS: { icon: MessageSquare, label: "SMS" },
  EMAIL: { icon: Mail, label: "Email" },
  PHONE: { icon: Phone, label: "Call Log" },
  DEMO: { icon: Video, label: "Demo" },
  MEETING: { icon: Calendar, label: "Meeting" },
};

export function ChatBubble({ msg, prospectName, isPending }: ChatBubbleProps) {
  const meta = ROLE_CONFIG[msg.role];
  const isRight = meta.side === "right";
  const typeInfo = TYPE_CONFIG[msg.type];
  const TypeIcon = typeInfo.icon;

  const time = new Date(msg.createdAt).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className={cn(
      "flex w-full mb-6 transition-all duration-300", 
      isRight ? "justify-end" : "justify-start",
      isPending && "opacity-60" // <-- Fades the bubble slightly while sending
    )}>
      <div className={cn("flex gap-3 max-w-[85%] md:max-w-[75%]", isRight ? "flex-row-reverse" : "flex-row")}>

        <div className="flex flex-col items-center shrink-0 mt-0.5">
          <Avatar className="h-8 w-8 shadow-sm border border-zinc-200 dark:border-zinc-700">
            <AvatarFallback className={cn(
              "bg-background",
              msg.role === "AI" && "text-indigo-600 dark:text-indigo-400",
              msg.role === "OPERATOR" && "text-blue-600 dark:text-blue-400",
              msg.role === "CLIENT" && "text-zinc-600 dark:text-zinc-400"
            )}>
              <meta.icon size={16} />
            </AvatarFallback>
          </Avatar>
        </div>

        <div className={cn("flex flex-col gap-1.5", isRight ? "items-end" : "items-start")}>
          <div className="flex items-baseline gap-2 px-1">
            <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              {isRight ? prospectName ?? "Client" : meta.label}
            </span>
            
            {/* Show Loading Spinner OR Time */}
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

          <div className={cn(
            "relative flex flex-col px-4 py-3 rounded-2xl text-[14px] leading-relaxed shadow-sm wrap-break-word",
            meta.bubble,
            isRight ? "rounded-tr-sm" : "rounded-tl-sm"
          )}>
            <div className="flex items-center gap-1.5 pb-2 mb-2 border-b border-current/10 opacity-70">
              <TypeIcon size={14} strokeWidth={2.5} />
              <span className="text-[10px] uppercase tracking-widest font-bold">
                {typeInfo.label}
              </span>
            </div>

            {msg.mediaUrl && (
              <InteractiveChatImage mediaUrl={msg.mediaUrl} />
            )}

            <div className="whitespace-pre-wrap">
              {msg.body}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}