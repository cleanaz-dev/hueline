"use client"

import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch"; // Radix/Shadcn switch
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Bot, User } from "lucide-react";

export function ChatDrawer({ prospect, isOpen, onClose }: any) {
  if (!prospect) return null;

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="sm:max-w-125 flex flex-col h-full">
        <SheetHeader className="border-b pb-4">
          <div className="flex justify-between items-center">
            <SheetTitle>{prospect.name}</SheetTitle>
            <Badge variant={prospect.status === "BOOKED" ? "default" : "secondary"}>
              {prospect.status}
            </Badge>
          </div>
          <div className="flex items-center gap-2 pt-2">
            <Switch id="ai-mode" defaultChecked />
            <label htmlFor="ai-mode" className="text-xs font-medium text-muted-foreground">
              AI Nurturing Active
            </label>
          </div>
        </SheetHeader>

        <ScrollArea className="flex-1 pr-4 py-4">
          <div className="space-y-4">
            {prospect.communication.map((msg: any) => (
              <div key={msg.id} className={`flex ${msg.role === 'AI' ? 'justify-start' : 'justify-end'}`}>
                <div className={`flex gap-2 max-w-[80%] ${msg.role === 'AI' ? 'flex-row' : 'flex-row-reverse'}`}>
                  <div className={`mt-1 p-1 rounded-full h-fit ${msg.role === 'AI' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'}`}>
                    {msg.role === 'AI' ? <Bot size={14} /> : <User size={14} />}
                  </div>
                  <div className={`p-3 rounded-2xl text-sm ${
                    msg.role === 'AI' 
                    ? 'bg-blue-600 text-white rounded-tl-none' 
                    : 'bg-muted text-foreground rounded-tr-none'
                  }`}>
                    {msg.body}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        <div className="pt-4 border-t">
          <form className="flex gap-2" onSubmit={(e) => e.preventDefault()}>
            <Input placeholder="Type manual message..." className="flex-1" />
            <Button type="submit" size="icon">
              <Send size={18} />
            </Button>
          </form>
          <p className="text-[10px] text-center text-muted-foreground mt-2">
            Manual messages will temporarily pause AI responses for 2 hours.
          </p>
        </div>
      </SheetContent>
    </Sheet>
  );
}