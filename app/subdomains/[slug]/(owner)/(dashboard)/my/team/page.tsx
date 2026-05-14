"use client";

import { useOwner } from "@/context/owner-context";
import { HatGlasses, Users, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function Page() {
  const { isUsersLoading, users, refreshUsers } = useOwner();

  return (
    <div className="container max-w-6xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 mb-8">
        <div className="flex items-center gap-4">
          <div className="hidden md:flex w-14 h-14 rounded-2xl border border-zinc-200 bg-zinc-100 items-center justify-center shadow-sm">
            <HatGlasses className="w-7 h-7 text-zinc-700" />
          </div>

          <div>
            <h1 className="text-3xl font-bold tracking-tight text-zinc-900">
              Team Members
            </h1>

            <p className="text-sm text-zinc-500 mt-1">
              View, manage, and invite team members to your workspace.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-xl border bg-white px-4 py-2 shadow-sm">
            <Users className="w-4 h-4 text-zinc-500" />

            <span className="text-sm font-medium text-zinc-700">
              {users?.length ?? 0} Users
            </span>
          </div>

          <Button
            variant="outline"
            onClick={() => refreshUsers()}
            disabled={isUsersLoading}
            className="rounded-xl"
          >
            <RefreshCw
              className={`w-4 h-4 mr-2 ${
                isUsersLoading ? "animate-spin" : ""
              }`}
            />
            Refresh
          </Button>
        </div>
      </div>

      {/* Table Card */}
      <div className="rounded-3xl border border-zinc-200 bg-white shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-zinc-50">
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
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