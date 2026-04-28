"use client"

import * as React from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { RefreshCw, Send, Bot, User, ShieldAlert } from "lucide-react";

export function ChatDrawer({ prospect, isOpen, onClose }: any) {
  const [messages, setMessages] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [input, setInput] = React.useState("");

  // Function to fetch messages
  const fetchMessages = async () => {
    if (!prospect?.id) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/prospects/${prospect.id}/messages`);
      const data = await res.json();
      setMessages(data);
    } catch (err) {
      console.error("Refresh failed", err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch when drawer opens
  React.useEffect(() => {
    if (isOpen) fetchMessages();
  }, [isOpen, prospect?.id]);

  const handleManualSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    // Call your manual send API
    await fetch("/api/prospects/send-manual", {
      method: "POST",
      body: JSON.stringify({ 
        prospectId: prospect.id, 
        phone: prospect.phone, 
        body: input 
      }),
    });

    setInput("");
    fetchMessages(); // Refresh chat immediately after sending
  };

  if (!prospect) return null;

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="sm:max-w-125 flex flex-col h-full">
        <SheetHeader className="border-b pb-4 flex flex-row items-center justify-between">
          <div>
            <SheetTitle>{prospect.name}</SheetTitle>
            <p className="text-xs text-muted-foreground">{prospect.phone}</p>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={fetchMessages} 
            className={loading ? "animate-spin" : ""}
          >
            <RefreshCw size={18} />
          </Button>
        </SheetHeader>

        <ScrollArea className="flex-1 pr-4 py-4">
          <div className="space-y-4">
            {messages.map((msg: any) => (
              <div key={msg.id} className={`flex ${msg.role === 'CLIENT' ? 'justify-end' : 'justify-start'}`}>
                <div className={`p-3 rounded-2xl text-sm max-w-[80%] ${
                  msg.role === 'CLIENT' 
                    ? 'bg-muted text-foreground rounded-tr-none' 
                    : msg.role === 'OPERATOR'
                    ? 'bg-orange-600 text-white rounded-tl-none'
                    : 'bg-blue-600 text-white rounded-tl-none'
                }`}>
                  {msg.body}
                  <p className="text-[10px] mt-1 opacity-70">
                    {msg.role} • {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        <div className="pt-4 border-t space-y-2">
          <form className="flex gap-2" onSubmit={handleManualSend}>
            <Input 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type manual reply..." 
              className="flex-1" 
            />
            <Button type="submit" size="icon" disabled={!input.trim()}>
              <Send size={18} />
            </Button>
          </form>
          <div className="flex items-center gap-1 justify-center text-[10px] text-orange-600 font-medium">
            <ShieldAlert size={12} />
            Sending stops AI for 2 hours
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}