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
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { X, Send, Eye, Edit } from "lucide-react";
import { toast } from "sonner";

interface ShareProjectDialogProps {
  bookingId: string;
}

const emailSchema = z.string().email();

type AccessType = "customer" | "viewer";

export default function ShareProjectDialog({
  bookingId,
}: ShareProjectDialogProps) {
  const [emails, setEmails] = useState<string[]>([]);
  const [currentEmail, setCurrentEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [accessType, setAccessType] = useState<AccessType>("viewer");
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Autofocus email input when dialog opens
  const [inputRef, setInputRef] = useState<HTMLInputElement | null>(null);
  useEffect(() => {
    if (isOpen && inputRef) {
      inputRef.focus();
    }
  }, [isOpen, inputRef]);

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
      const response = await fetch(`/api/booking/${bookingId}/share-project`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emails, accessType }),
      });

      if (response.ok) {
        setIsOpen(false);
        setEmails([]);
        setCurrentEmail("");
        setEmailError("");
        setAccessType("viewer");
      }
      toast.success("📧 Email Sent Successfully!");
    } catch (error) {
      console.error("Failed to share project:", error);
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
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">Share Project</Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle className="font-semibold">Share Project</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Access Type Selection */}
          <div>
            <label className="text-sm font-medium">Access Type</label>
            <RadioGroup
              value={accessType}
              onValueChange={(value) => setAccessType(value as AccessType)}
              className="mt-2 space-y-2"
            >
              <div className="flex items-center space-x-2 border rounded-lg p-3 cursor-pointer hover:bg-gray-50">
                <RadioGroupItem value="viewer" id="viewer" />
                <Label htmlFor="viewer" className="flex-1 cursor-pointer">
                  <div className="flex items-center gap-2">
                    <Eye className="h-4 w-4 text-blue-500" />
                    <div>
                      <div className="font-medium">View Only</div>
                      <div className="text-xs text-gray-500">
                        Can view project details but cannot make changes
                      </div>
                    </div>
                  </div>
                </Label>
              </div>

              <div className="flex items-center space-x-2 border rounded-lg p-3 cursor-pointer hover:bg-gray-50">
                <RadioGroupItem value="customer" id="customer" />
                <Label htmlFor="customer" className="flex-1 cursor-pointer">
                  <div className="flex items-center gap-2">
                    <Edit className="h-4 w-4 text-green-500" />
                    <div>
                      <div className="font-medium">Full Access</div>
                      <div className="text-xs text-gray-500">
                        Can view and edit project details
                      </div>
                    </div>
                  </div>
                </Label>
              </div>
            </RadioGroup>
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
