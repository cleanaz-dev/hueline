"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useOwner } from "@/context/owner-context";
import { Switch } from "@/components/ui/switch";
import { Crown, UserRound } from "lucide-react";
import { Toggle } from "@/components/ui/toggle";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

export default function InviteTeamDialog() {
  const {
    inviteMemberDialogOpen,
    setInviteMemberDialogOpen,
    inviteMember,
    refreshUsers,
    subdomain,
  } = useOwner();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("MEMBER");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPasswordDefault, setIsPasswordDefault] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) {
      setError("Name and phone are required.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const success = await inviteMember(
        name.trim(),
        phone.trim(),
        email.trim(),
      );
      if (success) {
        // Reset form and close dialog
        setName("");
        setPhone("");
        setEmail("");
        setInviteMemberDialogOpen(false);
        // Optionally refetch customers
        refreshUsers();
      } else {
        setError("Failed to add customer. Please try again.");
      }
    } catch (err) {
      setError("An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseDialog = () => {
    setInviteMemberDialogOpen(false);
    setName("");
    setPhone("");
    setEmail("");
    setRole("MEMBER");
    setIsPasswordDefault(false);
  };

  return (
    <Dialog open={inviteMemberDialogOpen} onOpenChange={handleCloseDialog}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Invite New Team Member</DialogTitle>
            <DialogDescription>
              Enter team member details. Click save when you're done.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                className="col-span-3"
                disabled={isSubmitting}
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="phone" className="text-right">
                Phone
              </Label>
              <Input
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 555-1234"
                className="col-span-3"
                disabled={isSubmitting}
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="john@example.com"
                className="col-span-3"
                disabled={isSubmitting}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="role" className="text-right">
                Role
              </Label>
              <ToggleGroup
                type="single"
                value={role}
                onValueChange={(value) => value && setRole(value)} // prevent deselection
                className="col-span-3 flex gap-2"
              >
                <ToggleGroupItem value="MEMBER" aria-label="Member">
                  <UserRound className="mr-2 h-4 w-4" />
                  Member
                </ToggleGroupItem>
                <ToggleGroupItem value="ADMIN" aria-label="Admin">
                  <Crown className="mr-2 h-4 w-4" />
                  Admin
                </ToggleGroupItem>
              </ToggleGroup>
            </div>
            <div className="flex gap-2 mt-3">
              <Label htmlFor="defaultPassword">Default Password</Label>
              <Switch
                checked={isPasswordDefault}
                onCheckedChange={setIsPasswordDefault}
                defaultChecked={false}
              />
              {isPasswordDefault && (
                <span className="text-muted-foreground text-sm tracking-widest">
                  {`${subdomain.slug}1513HL!`}
                </span>
              )}
            </div>

            {error && <p className="text-sm text-red-500 mt-2">{error}</p>}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setInviteMemberDialogOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save & Send Email"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
