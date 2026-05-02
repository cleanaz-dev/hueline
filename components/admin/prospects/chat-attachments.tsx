"use client";

import * as React from "react";
import { FileText, Download, FileArchive } from "lucide-react";
import { InteractiveChatImage } from "./interactive-chat-image";
import { useSuperAdmin } from "@/context/super-admin-context";

interface Attachment {
  id: string;
  filename: string;
  mimeType: string;
  size: number;
  mediaUrl: string;
}

interface ChatAttachmentsProps {
  attachments?: Attachment[];
  prospectId?: string; // <-- 1. ADDED THIS: We need to know which prospect to generate this for
}

// Helper to make file sizes readable (e.g., "2.4 MB")
function formatBytes(bytes: number, decimals = 1) {
  if (!+bytes) return "0 Bytes";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes =["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

export function ChatAttachments({ attachments, prospectId }: ChatAttachmentsProps) {
  const { generateImage } = useSuperAdmin(); // Context hooked up!
  
  if (!attachments || attachments.length === 0) return null;

  return (
    <div className="flex flex-col gap-2 mb-2 w-full">
      {attachments.map((file) => {
        const isImage = file.mimeType.startsWith("image/");
        const isPDF = file.mimeType === "application/pdf";

        // ✅ ROUTE 1: IMAGES (Uses your magical Interactive UI)
        if (isImage && prospectId) {
          return (
            <div key={file.id} className="w-full">
              <InteractiveChatImage 
                mediaUrl={file.mediaUrl} 
                filename={file.filename}
                // 2. ADDED THIS: Wire up the onGenerate hook to your context!
                onGenerate={(payload) => {
                  generateImage(prospectId, file.mediaUrl, payload);
                }}
              />
            </div>
          );
        }

        // ✅ ROUTE 2: DOCUMENTS (PDFs, CSVs, Docs)
        return (
          <a
            key={file.id}
            href={file.mediaUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center justify-between p-2.5 rounded-xl border border-current/10 bg-background/50 hover:bg-background transition-colors w-full sm:w-62.5"
          >
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 text-indigo-500 shrink-0">
                {isPDF ? <FileText size={16} /> : <FileArchive size={16} />}
              </div>
              <div className="flex flex-col overflow-hidden">
                <span className="text-xs font-semibold truncate text-foreground leading-tight">
                  {file.filename}
                </span>
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">
                  {isPDF ? "PDF" : "FILE"} • {formatBytes(file.size)}
                </span>
              </div>
            </div>
            
            <div className="shrink-0 p-1.5 rounded-md text-muted-foreground group-hover:text-foreground group-hover:bg-muted transition-colors">
              <Download size={14} />
            </div>
          </a>
        );
      })}
    </div>
  );
}