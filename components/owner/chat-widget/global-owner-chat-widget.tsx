"use client";

import { AnimatePresence } from "framer-motion";
import { useOwner } from "@/context/owner-context";

// Import our new sub-components
import { WidgetIcon } from "./widget-icon";
import { WidgetList } from "./widget-list";
import { WidgetMinimized } from "./widget-minimized";
import { WidgetOpen } from "./widget-open";

export function GlobalOwnerChatWidget() {
  const { chatWindowState } = useOwner();

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end pointer-events-none">
      <AnimatePresence mode="wait">
        
        {chatWindowState === "icon" && <WidgetIcon key="icon" />}
        
        {chatWindowState === "list" && <WidgetList key="list" />}
        
        {chatWindowState === "minimized" && <WidgetMinimized key="minimized" />}
        
        {chatWindowState === "open" && <WidgetOpen key="open" />}

      </AnimatePresence>
    </div>
  );
}