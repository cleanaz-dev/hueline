// components/owner/chat-widget/widget-icon.tsx
import { motion } from "framer-motion";
import { MessageSquare } from "lucide-react";
import { useOwner } from "@/context/owner-context";
import { morphTransition } from "./shared";

export function WidgetIcon() {
  const { openChatList } = useOwner();

  return (
    <motion.button
      layoutId="chat-widget-morph"
      transition={morphTransition}
      onClick={openChatList}
      className="h-16 w-16 rounded-full bg-primary shadow-2xl flex items-center justify-center text-primary-foreground hover:scale-105 transition-transform pointer-events-auto"
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        <MessageSquare size={26} />
      </motion.div>
    </motion.button>
  );
}