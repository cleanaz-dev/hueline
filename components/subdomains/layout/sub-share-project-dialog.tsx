"use client";

import { useState, useEffect } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { X, Send, Eye, Edit, Info } from "lucide-react";
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
  slug
}: ShareProjectDialogProps) {
  const { isShareDialogOpen, setIsShareDialogOpen } = useBooking();
  const [emails, setEmails] = useState<string[]>([]);
  const [currentEmail, setCurrentEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [accessType, setAccessType] = useState<AccessType>("viewer");
  const [isLoading, setIsLoading] = useState(false);

  const [inputRef, setInputRef] = useState<HTMLInputElement | null>(null);
useEffect(() => {
  if (isShareDialogOpen && inputRef) {
    // Only auto-focus on desktop (screen width > 768px)
    if (window.innerWidth >= 768) {
      inputRef.focus();
    }
  }
}, [isShareDialogOpen, inputRef]);

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
      const response = await fetch(`/api/subdomain/${slug}/booking/${huelineId}/share-project`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emails, accessType }),
      });

      if (response.ok) {
        const data = await response.json();
        
        setIsShareDialogOpen(false);
        setEmails([]);
        setCurrentEmail("");
        setEmailError("");
        setAccessType("viewer");
        
        if (data.newSharesCount > 0 && data.updatedSharesCount > 0) {
          toast.success(`📧 ${data.newSharesCount} email(s) sent, ${data.updatedSharesCount} access updated`, {
            description: !hasSharedAccess ? "Unlock Image Generation" : undefined,
            duration: 5000,
            action: !hasSharedAccess ? {
              label: "Unlock",
              onClick: () => window.location.reload(),
            } : undefined,
          });
        } else if (data.newSharesCount > 0) {
          toast.success(`📧 ${data.newSharesCount} email(s) sent successfully!`, {
            description: !hasSharedAccess ? "Unlock Image Gen" : undefined,
            duration: 5000,
            action: !hasSharedAccess ? {
              label: "Unlock",
              onClick: () => window.location.reload(),
            } : undefined,
          });
        } else {
          toast.success(`✅ Access updated for ${data.updatedSharesCount} user(s)`);
        }
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
    <Dialog open={isShareDialogOpen} onOpenChange={setIsShareDialogOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          Share Project
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle className="font-semibold">Share Project</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Access Type Selection */}
          <div>
            <label className="text-sm font-medium mb-2 block">Access Type</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setAccessType("viewer")}
                className={`flex items-center gap-2 border rounded-lg p-3 cursor-pointer transition-all ${
                  accessType === "viewer" 
                    ? "border-blue-500 bg-blue-50" 
                    : "border-gray-200 hover:bg-gray-50"
                }`}
              >
                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                  accessType === "viewer" 
                    ? "border-blue-500" 
                    : "border-gray-300"
                }`}>
                  {accessType === "viewer" && (
                    <div className="w-2 h-2 rounded-full bg-blue-500" />
                  )}
                </div>
                <Eye className="hidden md:block h-4 w-4 text-blue-500" />
                <div className="font-medium text-xs md:text-sm">View Only</div>
              </button>

              <button
                type="button"
                onClick={() => setAccessType("customer")}
                className={`flex items-center gap-2 border rounded-lg p-3 cursor-pointer transition-all ${
                  accessType === "customer" 
                    ? "border-green-500 bg-green-50" 
                    : "border-gray-200 hover:bg-gray-50"
                }`}
              >
                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                  accessType === "customer" 
                    ? "border-green-500" 
                    : "border-gray-300"
                }`}>
                  {accessType === "customer" && (
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                  )}
                </div>
                <Edit className="hidden md:block h-4 w-4 text-green-500" />
                <div className="ont-medium text-xs md:text-sm">Full Access</div>
              </button>
            </div>

            {/* Dynamic Description */}
            <div className={`mt-3 rounded-lg p-3 border ${
              accessType === "viewer" 
                ? "bg-blue-50 border-blue-200" 
                : "bg-green-50 border-green-200"
            }`}>
              <div className="flex items-center gap-2">
                <Info className={`h-4 w-4 hidden md:block${
                  accessType === "viewer" ? "text-blue-500" : "text-green-500"
                }`} />
                <p className="text-xs text-gray-700">
                  {accessType === "viewer" 
                    ? "View project details but cannot make any changes or edits." 
                    : "View and edit project details, including mockups and color selections."}
                </p>
              </div>
            </div>
          </div>

          {/* Email input */}
          <div>
            <label className="text-sm font-medium">Email Addresses</label>

            <div className="flex gap-2 mt-1">
              <Input
                type="email"
                placeholder="Enter email"
                value={currentEmail}
                ref={setInputRef}
                onChange={(e) => {
                  setCurrentEmail(e.target.value);
                  setEmailError("");
                }}
                onKeyDown={handleKeyDown}
              />
              <Button
                type="button"
                onClick={addEmail}
                disabled={!currentEmail.trim()}
              >
                Add
              </Button>
            </div>

            {emailError && (
              <p className="text-xs text-red-500 mt-1">{emailError}</p>
            )}
          </div>

          {/* Email chips */}
          {emails.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {emails.map((email) => (
                <div
                  key={email}
                  className="flex items-center gap-2 bg-gray-100 rounded-full px-3 py-1"
                >
                  <span className="text-sm">{email}</span>
                  <button
                    onClick={() => removeEmail(email)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Submit */}
          <Button
            onClick={handleSubmit}
            disabled={emails.length === 0 || isLoading}
            className="w-full"
          >
            <Send className="h-4 w-4 mr-2" />
            {isLoading ? "Sending..." : "Share Project"}
          </Button>

          {/* Coming soon note */}
          <p className="text-xs text-gray-500 text-center pt-1">
            📱 SMS sharing support coming soon
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}