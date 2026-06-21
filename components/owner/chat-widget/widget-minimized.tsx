// components/owner/chat-widget/widget-minimized.tsx
import { motion } from "framer-motion";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { UserRound, MessageSquare, X } from "lucide-react";
import { useOwner } from "@/context/owner-context";
import { morphTransition } from "./shared";

export function WidgetMinimized() {
  const { activeThread: customer, toggleMinimize, closeChat } = useOwner();

  const initials = customer?.name
    ?.split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <motion.div
      layoutId="chat-widget-morph"
      transition={morphTransition}
      className="flex items-center bg-primary text-primary-foreground shadow-2xl rounded-full p-1.5 pr-2 pointer-events-auto border border-primary/20"
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="flex items-center"
      >
        <div
          className="flex items-center gap-3 cursor-pointer hover:bg-black/10 dark:hover:bg-white/10 px-2 py-1 rounded-full transition-colors"
          onClick={toggleMinimize}
        >
          <div className="relative">
            <Avatar className="h-9 w-9 border-2 border-primary">
              <AvatarFallback className="bg-zinc-200 text-zinc-800 font-bold text-xs">
                {initials ?? <UserRound size={16} />}
              </AvatarFallback>
            </Avatar>
            <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 bg-green-500 rounded-full border-2 border-primary" />
          </div>
          <div className="flex flex-col items-start text-sm text-left pr-2">
            <span className="font-semibold line-clamp-1 max-w-[120px]">
              {customer?.name}
            </span>
            <span className="text-[10px] opacity-80 flex items-center gap-1">
              <MessageSquare size={10} /> Active
            </span>
          </div>
        </div>

        <button
          onClick={closeChat}
          className="h-8 w-8 flex items-center justify-center rounded-full hover:bg-black/20 dark:hover:bg-white/20 transition-colors shrink-0 ml-1"
        >
          <X size={16} />
        </button>
      </motion.div>
    </motion.div>
  );
}