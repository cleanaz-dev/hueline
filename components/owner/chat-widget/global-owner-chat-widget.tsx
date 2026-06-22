import { AnimatePresence } from "framer-motion";
import { useOwner } from "@/context/owner-context";

import { WidgetIcon } from "./widget-icon";
import { WidgetList } from "./widget-list";
import { WidgetMinimized } from "./widget-minimized";
import { WidgetOpen } from "./widget-open";
import { WidgetNewThreadAlert } from "./widget-new-thread-alert"; 

export function GlobalOwnerChatWidget() {
  const { chatWindowState, newThreadAlert } = useOwner(); // <-- Pull newThreadAlert here

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end pointer-events-none">
      
      {/* THE NEW ALERT WIDGET */}
      <AnimatePresence>
        {/* Conditionally render here so Framer Motion can freeze the prop during exit */}
        {newThreadAlert && (
          <WidgetNewThreadAlert 
            key="new-thread-alert" 
            threadAlert={newThreadAlert} 
          />
        )}
      </AnimatePresence>

      {/* EXISTING WINDOW STATES */}
      <AnimatePresence mode="wait">
        {chatWindowState === "icon" && <WidgetIcon key="icon" />}
        {chatWindowState === "list" && <WidgetList key="list" />}
        {chatWindowState === "minimized" && <WidgetMinimized key="minimized" />}
        {chatWindowState === "open" && <WidgetOpen key="open" />}
      </AnimatePresence>
      
    </div>
  );
}