// components/owner/chat-widget/widget-list.tsx
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { X, UserRound, ChevronRight } from "lucide-react";
import { useOwner } from "@/context/owner-context";
import { morphTransition } from "./shared";

export function WidgetList() {
  const { closeChat, chatThreads, isThreadsLoading, openChat } = useOwner();

  return (
    <motion.div
      layoutId="chat-widget-morph"
      transition={morphTransition}
      className="w-[320px] h-[450px] bg-background shadow-2xl rounded-3xl overflow-hidden border border-border pointer-events-auto flex flex-col"
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="flex flex-col h-full"
      >
        <div className="flex items-center justify-between px-5 py-4 border-b bg-muted/40 shrink-0">
          <h3 className="font-bold text-sm">Recent Threads</h3>
          <Button
            variant="ghost"
            size="icon"
            onClick={closeChat}
            className="h-7 w-7 rounded-full text-muted-foreground hover:bg-black/10 dark:hover:bg-white/10"
          >
            <X size={16} />
          </Button>
        </div>
        <ScrollArea className="flex-1 p-2">
          {isThreadsLoading ? (
            <p className="text-center text-muted-foreground text-xs mt-10">
              Loading threads...
            </p>
          ) : chatThreads.length === 0 ? (
            <p className="text-center text-muted-foreground text-xs mt-10">
              No active threads found.
            </p>
          ) : (
            chatThreads.slice(0, 10).map((thread) => (
              <div
                key={thread.id}
                onClick={() =>
                  openChat({
                    id: thread.customerId,
                    threadId: thread.id,
                    name: thread.customer?.name ?? "Unknown",
                    phone: thread.customer?.phone ?? undefined,
                    email: thread.customer?.email ?? undefined,
                    isAutoPilot: thread.isAutoPilot,
                    shortId: thread.shortId,
                  })
                }
                className="flex items-center justify-between p-3 hover:bg-muted/50 rounded-xl cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Avatar className="h-9 w-9">
                    <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                      {thread.customer?.name?.slice(0, 2).toUpperCase() ?? (
                        <UserRound size={16} />
                      )}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold line-clamp-1">
                      {thread.customer?.name ?? "Unknown"}
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      Tap to view thread
                    </span>
                  </div>
                </div>
                <ChevronRight size={16} className="text-muted-foreground" />
              </div>
            ))
          )}
        </ScrollArea>
      </motion.div>
    </motion.div>
  );
}