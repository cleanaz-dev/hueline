"use client";

import { useState } from "react";
import { Loader2, Send, StickyNote, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createNoteLog } from "@/lib/prisma/mutations/logs/create-note-log";
import { useSWRConfig } from "swr"; 

interface IntelAddNoteProps {
  huelineId: string;
  slug: string;
  onCancel: () => void;
}

export function IntelAddNote({ huelineId, slug, onCancel }: IntelAddNoteProps) {
  const [note, setNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { mutate } = useSWRConfig();

  const handleSubmit = async () => {
    if (!note.trim()) return;
    setIsSubmitting(true);

    await createNoteLog(huelineId, note);

    // ⚡️ Instant Refresh: Re-fetch the logs for this booking
    await mutate(`/api/subdomain/${slug}/booking/${huelineId}/logs`);
    
    setNote("");
    setIsSubmitting(false);
    onCancel(); // Close input after sending
  };

  return (
    <div className="bg-amber-50/50 border-b border-amber-100 p-4 animate-in slide-in-from-top-2 duration-200">
      <div className="flex gap-3">
        <div className="mt-1 shrink-0">
            <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center border border-amber-200 shadow-sm">
                <StickyNote className="w-4 h-4 text-amber-600" />
            </div>
        </div>
        <div className="flex-1 space-y-2">
          <textarea
            autoFocus
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Type a note about this project..."
            className="w-full bg-white border border-amber-200 rounded-lg p-3 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400 resize-none shadow-sm"
            rows={2}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSubmit();
              }
            }}
          />
          <div className="flex justify-end gap-2">
             <Button 
               variant="ghost" 
               size="sm" 
               onClick={onCancel} 
               className="text-slate-500 hover:text-slate-700 h-8"
             >
               Cancel
             </Button>
             <Button 
               size="sm" 
               onClick={handleSubmit} 
               disabled={isSubmitting || !note.trim()}
               className="bg-amber-600 hover:bg-amber-700 text-white h-8 gap-2"
             >
               {isSubmitting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
               Save Note
             </Button>
          </div>
        </div>
      </div>
    </div>
  );
}