import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Bot, UserRound } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatBubbleProps {
  msg: {
    id: string;
    role: "CLIENT" | "AI" | "OPERATOR";
    body: string;
    createdAt: string;
  };
  prospectName?: string;
}

const ROLE_CONFIG = {
  CLIENT: {
    label: "Client",
    bubbleClass: "bg-muted text-foreground",
    align: "justify-end",
    avatarClass: "bg-zinc-200 dark:bg-zinc-700",
    icon: <UserRound size={14} className="text-zinc-600 dark:text-zinc-300" />,
    side: "right" as const,
  },
  AI: {
    label: "AI",
    bubbleClass: "bg-blue-600 text-white",
    align: "justify-start",
    avatarClass: "bg-blue-100 dark:bg-blue-900",
    icon: <Bot size={14} className="text-blue-600 dark:text-blue-300" />,
    side: "left" as const,
  },
  OPERATOR: {
    label: "Operator",
    bubbleClass: "bg-orange-500 text-white",
    align: "justify-start",
    avatarClass: "bg-orange-100 dark:bg-orange-900",
    icon: <UserRound size={14} className="text-orange-600 dark:text-orange-300" />,
    side: "left" as const,
  },
};

export function ChatBubble({ msg, prospectName }: ChatBubbleProps) {
  const config = ROLE_CONFIG[msg.role] ?? ROLE_CONFIG.AI;
  const isRight = config.side === "right";
  const time = new Date(msg.createdAt).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  const avatar = (
    <Avatar className="h-7 w-7 shrink-0 mt-0.5">
      <AvatarFallback className={cn("text-xs", config.avatarClass)}>
        {config.icon}
      </AvatarFallback>
    </Avatar>
  );

  return (
    <div className={cn("flex gap-2.5 items-end", config.align)}>
      {!isRight && avatar}

      <div className={cn("flex flex-col gap-1", isRight ? "items-end" : "items-start")}>
        <span className="text-[10px] font-medium text-muted-foreground px-1">
          {isRight ? (prospectName ?? "Client") : config.label}
        </span>

        <div
          className={cn(
            "px-4 py-2.5 rounded-2xl text-sm leading-relaxed max-w-[72%] shadow-sm",
            config.bubbleClass,
            isRight ? "rounded-br-sm" : "rounded-bl-sm"
          )}
        >
          {msg.body}
        </div>

        <span className="text-[10px] text-muted-foreground px-1">{time}</span>
      </div>

      {isRight && avatar}
    </div>
  );
}