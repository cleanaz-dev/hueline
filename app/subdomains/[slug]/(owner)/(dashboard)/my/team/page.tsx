"use client";

import { useOwner } from "@/context/owner-context";
import { HatGlasses, Users, RefreshCw, Users2, UsersRound, Edit2, Trash, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import OwnerPageHeader from "@/components/owner/owner-page.header";

export default function Page() {
  const { isUsersLoading, users, setInviteMemberDialogOpen } = useOwner();

  return (
    <div className="container max-w-7xl mx-auto px-4">
      {/* Header */}
      <OwnerPageHeader
        title="Team Members" 
        description=" View, manage, and invite team members to your workspace."
        count={users?.length ?? 0}
        countIcon={<UsersRound className="w-4 h-4 text-zinc-500" />}
        countLabel="Team Members"
        icon={ <UsersRound className="w-7 h-7 text-zinc-700" />}
        addButtonLabel="Invite Member"
        onAddClick={() => setInviteMemberDialogOpen(true)}
      />

      {/* Table Card */}
      <div className="rounded-3xl border border-zinc-200 bg-white shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-zinc-50">
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {isUsersLoading ? (
              <TableRow>
                <TableCell
                  colSpan={3}
                  className="text-center py-10 text-zinc-500"
                >
                  Loading team members...
                </TableCell>
              </TableRow>
            ) : users?.length ? (
              users.map((u) => (
                <TableRow key={u.id}>
                  <TableCell className="font-medium">
                    {u.name || "Unnamed User"}
                  </TableCell>

                  <TableCell className="text-zinc-600">
                    {u.email}
                  </TableCell>

                  <TableCell>
                    <div className="inline-flex items-center rounded-full border border-zinc-200 bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-700">
                      {u.role}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button>
                        <Edit2 />
                      </Button>
                      <Button variant="destructive">
                        <Trash2 />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={3}
                  className="text-center py-10 text-zinc-500"
                >
                  No team members found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}