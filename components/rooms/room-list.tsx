"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import useSWR from "swr"; // 1. Import SWR
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import {
  MoreHorizontal,
  ArrowUpDown,
  Search,
  Users,
  DatabaseZap,
  FolderOpen,
  Trash2,
  SquareArrowOutUpRight,
  UserCircle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useOwner } from "@/context/owner-context";
import { DeleteRoomDialog } from "@/components/rooms/delete-room-dialog";

// 2. Define standard fetcher
const fetcher = (url: string) => fetch(url).then((res) => res.json());

// Helper
const formatRoomName = (key: string) => {
  if (!key) return "Untitled Room";
  const parts = key.split("-");
  if (parts.length > 2) parts.pop();
  return parts.map((p) => p.charAt(0).toUpperCase() + p.slice(1)).join(" ");
};

export default function RoomList() {
  const router = useRouter();
  const { subdomain } = useOwner();
  const [sorting, setSorting] = React.useState<SortingState>([]);

  // Dialog State
  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const [roomToDelete, setRoomToDelete] = React.useState<any>(null);

  // 3. SWR Implementation
  // We use the subdomain slug to build the API endpoint.
  // We use subdomain?.rooms as fallbackData so the table renders immediately from server props/context before first fetch.
  const apiUrl = subdomain?.slug
    ? `/api/subdomain/${subdomain.slug}/room`
    : null;

  const {
    data: rooms,
    mutate,
    isLoading,
  } = useSWR(apiUrl, fetcher, {
    fallbackData: subdomain?.rooms || [],
    revalidateOnFocus: false,
  });

  const initiateDelete = (room: any) => {
    setRoomToDelete(room);
    setDeleteOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!roomToDelete || !subdomain?.slug) return;

    // 4. Optimistic Update (Optional but recommended)
    // Instantly remove the item from the list visually before the API completes
    const updatedRooms = rooms.filter(
      (r: any) => r.roomKey !== roomToDelete.roomKey
    );
    mutate(updatedRooms, false);

    try {
      await fetch(
        `/api/subdomain/${subdomain.slug}/room/${roomToDelete.roomKey}/crud`,
        {
          method: "DELETE",
        }
      );

      setDeleteOpen(false);
      setRoomToDelete(null);

      // Trigger a revalidation to ensure data sync with server
      mutate();

      // router.refresh() is usually not needed anymore for the list itself,
      // but keeps the server context up to date if needed elsewhere.
      router.refresh();
    } catch (error) {
      console.error("Failed to delete room:", error);
      // If error, trigger re-fetch to restore the list
      mutate();
    }
  };

  const columns: ColumnDef<any>[] = [
    {
      accessorKey: "roomKey",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            className="-ml-4 h-8"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Session Name
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-semibold text-zinc-900">
            {formatRoomName(row.original.roomKey)}
          </span>
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <Users className="w-3 h-3" />{" "}
            {row.original.clientName || "Quick Session"}
          </span>
        </div>
      ),
    },
    {
      accessorKey: "createdBy",
      header: ({ column }) => {
        return <p>Created By</p>;
      },
      cell: ({ row }) => {
        const creator = row.original.creator;

        if (!creator) {
          return <span className="text-muted-foreground">Unknown</span>;
        }

        // Get first letter of name or email
        const initial = creator.name
          ? creator.name.charAt(0).toUpperCase()
          : creator.email.charAt(0).toUpperCase();

        return (
          <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8">
              <AvatarImage
                src={creator.imageUrl || undefined}
                alt={creator.name || creator.email}
              />
              <AvatarFallback>{initial}</AvatarFallback>
            </Avatar>
            <span className="text-sm">{creator.name || creator.email}</span>
          </div>
        );
      },
    },
    {
      accessorKey: "sessionType",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            className="-ml-4 h-8"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Type
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => (
        <div>
          <span className="font-bold text-muted-foreground">
            {row.original.sessionType}
          </span>
        </div>
      ),
    },

    {
      id: "scopeCount",
      header: "Intel Captured",
      accessorFn: (row) => {
        const data = row.scopeData as any;
        if (Array.isArray(data)) return data.length;
        return data?.items?.length || 0;
      },
      cell: ({ getValue }) => (
        <div className="flex items-center gap-2 text-xs font-medium text-zinc-600">
          <DatabaseZap className="w-4 h-4 text-purple-500" />
          {getValue() as number} Items
        </div>
      ),
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => (
        <div className="text-right">
          <Button
            variant="ghost"
            className="h-8 p-0"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Date <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        </div>
      ),
      cell: ({ row }) => (
        <div className="text-right text-muted-foreground text-xs font-mono">
          {new Date(row.getValue("createdAt")).toLocaleDateString()}
        </div>
      ),
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <div className="flex items-center justify-end gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={() => router.push(`/my/rooms/${row.original.roomKey}`)}
              >
                <SquareArrowOutUpRight className="mr-2 h-4 w-4 hover:text-white" />
                View Session
              </DropdownMenuItem>
              <DropdownMenuItem
                variant="destructive"
                className="cursor-pointer"
                onClick={() => initiateDelete(row.original)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    },
  ];

  const table = useReactTable({
    data: rooms || [], // Ensure data is never null
    columns,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    state: { sorting },
  });

  return (
    <div className="w-full space-y-4">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-lg font-bold tracking-tight">Session History</h2>
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Filter sessions..."
            className="pl-9 h-9 bg-white"
          />
        </div>
      </div>

      <div className="hidden md:block rounded-xl border border-zinc-200 bg-white shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-zinc-50">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className="text-xs font-bold uppercase tracking-wider text-zinc-500 px-4"
                  >
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {/* Handle Loading State */}
            {isLoading && !rooms.length ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  Loading sessions...
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  className="hover:bg-zinc-50/50 transition-colors"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="py-3 px-4">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center text-muted-foreground"
                >
                  No sessions found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="grid grid-cols-1 gap-4 md:hidden">
        {table.getRowModel().rows.map((row) => (
          <Card
            key={row.id}
            className="border-zinc-200 shadow-sm"
            onClick={() => router.push(`/my/rooms/${row.original.roomKey}`)}
          >
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base">
                  {formatRoomName(row.original.roomKey)}
                </CardTitle>
                <div className="text-xs text-muted-foreground">
                  {row.original.clientName}
                </div>
              </div>
              <FolderOpen className="text-zinc-300" />
            </CardHeader>
            <CardContent>
              <Button className="w-full" variant="outline">
                View Session
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <DeleteRoomDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onConfirm={handleConfirmDelete}
        roomName={
          roomToDelete ? formatRoomName(roomToDelete.roomKey) : undefined
        }
      />
    </div>
  );
}
