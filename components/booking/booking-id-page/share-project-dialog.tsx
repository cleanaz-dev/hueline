"use client"

import { useState, useEffect } from "react"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { X, Send } from "lucide-react"

interface ShareProjectDialogProps {
  bookingId: string
}

const emailSchema = z.string().email()

export default function ShareProjectDialog({ bookingId }: ShareProjectDialogProps) {
  const [emails, setEmails] = useState<string[]>([])
  const [currentEmail, setCurrentEmail] = useState("")
  const [emailError, setEmailError] = useState("")
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Autofocus email input when dialog opens
  const [inputRef, setInputRef] = useState<HTMLInputElement | null>(null)
  useEffect(() => {
    if (isOpen && inputRef) {
      inputRef.focus()
    }
  }, [isOpen, inputRef])

  const addEmail = () => {
    setEmailError("")

    if (!currentEmail.trim()) return

    const result = emailSchema.safeParse(currentEmail.trim())

    if (!result.success) {
      setEmailError("Please enter a valid email address.")
      return
    }

    const email = result.data

    if (!emails.includes(email)) {
      setEmails((prev) => [...prev, email])
      setCurrentEmail("")
    }
  }

  const removeEmail = (email: string) => {
    setEmails((prev) => prev.filter((e) => e !== email))
  }

  const handleSubmit = async () => {
    if (emails.length === 0) return

    setIsLoading(true)

    try {
      const response = await fetch(`/api/booking/${bookingId}/share-project`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emails }),
      })

      if (response.ok) {
        setIsOpen(false)
        setEmails([])
        setCurrentEmail("")
        setEmailError("")
      }
    } catch (error) {
      console.error("Failed to share project:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault()
      addEmail()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Share Project</Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle className="font-semibold">Share Project</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">

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
                  setCurrentEmail(e.target.value)
                  setEmailError("")
                }}
                onKeyDown={handleKeyDown}
              />
              <Button type="button" onClick={addEmail}>
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
  )
}
