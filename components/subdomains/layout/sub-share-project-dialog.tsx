"use client";

import { useState } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, Send, Eye, Edit, Info, Share2, Mail, Plus } from "lucide-react";
import { toast } from "sonner";
import { useBooking } from "@/context/booking-context";

interface ShareProjectDialogProps {
  huelineId: string;
  hasSharedAccess: boolean;
  slug: string;
}

const emailSchema = z.email();

type AccessType = "customer" | "viewer";

export default function SubShareProjectDialog({
  huelineId,
  hasSharedAccess,
  slug,
}: ShareProjectDialogProps) {
  const { isShareDialogOpen, setIsShareDialogOpen } = useBooking();
  const [emails, setEmails] = useState<string[]>([]);
  const [currentEmail, setCurrentEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [accessType, setAccessType] = useState<AccessType>("viewer");
  const [isLoading, setIsLoading] = useState(false);

  const addEmail = () => {
    setEmailError("");
    if (!currentEmail.trim()) return;

    const result = emailSchema.safeParse(currentEmail.trim());

    if (!result.success) {
      setEmailError("Please enter a valid email address.");
      return;
    }

    const email = result.data;
    if (!emails.includes(email)) {
      setEmails((prev) => [...prev, email]);
      setCurrentEmail("");
    }
  };

  const removeEmail = (email: string) => {
    setEmails((prev) => prev.filter((e) => e !== email));
  };

  const handleSubmit = async () => {
    if (emails.length === 0) return;
    setIsLoading(true);

    try {
      const response = await fetch(
        `/api/subdomain/${slug}/booking/${huelineId}/share-project`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ emails, accessType }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        setIsShareDialogOpen(false);
        setEmails([]);
        setCurrentEmail("");
        setAccessType("viewer");

        const message =
          data.newSharesCount > 0
            ? `📧 ${data.newSharesCount} email(s) sent!`
            : "✅ Access updated";

        toast.success(message, {
          description: !hasSharedAccess ? "Unlock Image Generation" : undefined,
          action: !hasSharedAccess
            ? { label: "Unlock", onClick: () => window.location.reload() }
            : undefined,
        });
      }
    } catch (error) {
      console.error("Failed to share project:", error);
      toast.error("Failed to share project");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addEmail();
    }
  };

  return (
    <>
      {/* Trigger Button */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsShareDialogOpen(true)}
      >
        <span className="hidden md:block">Share Project</span>
        <span className="block md:hidden">
          <Share2 className="w-4 h-4" />
        </span>
      </Button>

      {/* DIALOG / SHEET OVERLAY */}
      {isShareDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center p-0 sm:p-4">
          
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
            onClick={() => setIsShareDialogOpen(false)}
          />

          {/* MAIN CARD: Bottom Sheet (Mobile) -> Center Modal (Desktop) */}
          <div className="relative bg-white w-full sm:max-w-md 
                          h-[85vh] sm:h-auto sm:max-h-[90vh] 
                          rounded-t-[2rem] sm:rounded-2xl 
                          flex flex-col shadow-2xl overflow-hidden 
                          animate-in slide-in-from-bottom-10 fade-in duration-300">
            
            {/* Mobile Grab Handle */}
            <div
              className="sm:hidden w-full flex justify-center pt-3 pb-2 flex-shrink-0 cursor-grab active:cursor-grabbing"
              onClick={() => setIsShareDialogOpen(false)}
            >
              <div className="w-10 h-1.5 bg-gray-200 rounded-full hover:bg-gray-300 transition-colors" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-6 pt-2 pb-4 sm:p-6 border-b-0 sm:border-b shrink-0">
              <div>
                <h3 className="text-xl font-bold text-gray-900">Share Project</h3>
                <p className="text-sm text-gray-500 mt-1">
                  Invite others to view or collaborate.
                </p>
              </div>
              <button
                onClick={() => setIsShareDialogOpen(false)}
                className="hidden sm:flex p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content Body */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
              
              {/* 1. Email Input Section */}
              <div className="space-y-3">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                   <Mail className="w-3.5 h-3.5" /> Invite by Email
                </label>
                
                <div className="flex gap-2">
                  <Input
                    type="email"
                    placeholder="name@example.com"
                    value={currentEmail}
                    onChange={(e) => {
                      setCurrentEmail(e.target.value);
                      setEmailError("");
                    }}
                    onKeyDown={handleKeyDown}
                    className="h-11 rounded-xl"
                  />
                  <Button
                    type="button"
                    onClick={addEmail}
                    disabled={!currentEmail.trim()}
                    size="icon"
                    className="h-11 w-11 rounded-xl shrink-0"
                  >
                    <Plus className="w-5 h-5" />
                  </Button>
                </div>
                
                {emailError && (
                  <p className="text-xs text-red-500 font-medium pl-1">{emailError}</p>
                )}

                {/* Email Chips Area */}
                {emails.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-2">
                    {emails.map((email) => (
                      <div
                        key={email}
                        className="flex items-center gap-1.5 bg-gray-100 border border-gray-200 rounded-full pl-3 pr-1 py-1 text-sm text-gray-700 animate-in zoom-in-50 duration-200"
                      >
                        <span className="max-w-[180px] truncate">{email}</span>
                        <button
                          onClick={() => removeEmail(email)}
                          className="p-1 hover:bg-gray-200 rounded-full transition-colors text-gray-400 hover:text-red-500"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* 2. Access Level Selector */}
              <div className="space-y-3">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                   Access Level
                </label>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setAccessType("viewer")}
                    className={`relative flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left ${
                      accessType === "viewer"
                        ? "border-blue-500 bg-blue-50/50"
                        : "border-gray-100 hover:border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                      accessType === "viewer" ? "border-blue-500" : "border-gray-300"
                    }`}>
                      {accessType === "viewer" && <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />}
                    </div>
                    <div>
                        <div className="font-bold text-sm text-gray-900 flex items-center gap-2">
                            View Only <Eye className="w-3 h-3 text-blue-500" />
                        </div>
                        <div className="text-[10px] text-gray-500 leading-tight mt-0.5">
                            Read-only access to project details.
                        </div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setAccessType("customer")}
                    className={`relative flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left ${
                      accessType === "customer"
                        ? "border-green-500 bg-green-50/50"
                        : "border-gray-100 hover:border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                      accessType === "customer" ? "border-green-500" : "border-gray-300"
                    }`}>
                      {accessType === "customer" && <div className="w-2.5 h-2.5 rounded-full bg-green-500" />}
                    </div>
                    <div>
                        <div className="font-bold text-sm text-gray-900 flex items-center gap-2">
                            Full Access <Edit className="w-3 h-3 text-green-500" />
                        </div>
                        <div className="text-[10px] text-gray-500 leading-tight mt-0.5">
                            Can edit mockups & colors.
                        </div>
                    </div>
                  </button>
                </div>

                {/* Info Note */}
                <div className={`flex items-start gap-2 p-3 rounded-lg text-xs border ${
                   accessType === "viewer" ? "bg-blue-50 border-blue-100 text-blue-700" : "bg-green-50 border-green-100 text-green-700"
                }`}>
                    <Info className="w-4 h-4 shrink-0 mt-0.5" />
                    <p>
                        {accessType === "viewer" 
                            ? "Viewers can see the project dashboard but cannot save changes or request new generations." 
                            : "Full Access users can modify paint colors, generate new mockups, and export files."}
                    </p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t bg-gray-50 shrink-0 pb-8 sm:pb-6">
                <Button
                    onClick={handleSubmit}
                    disabled={emails.length === 0 || isLoading}
                    className="w-full h-12 text-base rounded-xl font-medium shadow-lg shadow-blue-500/10"
                    size="lg"
                >
                    {isLoading ? (
                         "Sending invites..."
                    ) : (
                        <>
                            <Send className="h-4 w-4 mr-2" />
                            Share with {emails.length > 0 ? `${emails.length} People` : "..."}
                        </>
                    )}
                </Button>
                <p className="text-[10px] text-gray-400 text-center mt-3">
                    Recipients will receive an email with a secure access link.
                </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}