"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
  RowSelectionState, // Import RowSelectionState type
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
  Archive, // Added Archive Icon
  Loader2, // Added Loader Icon for loading states
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
import { Checkbox } from "@/components/ui/checkbox"; // Make sure you have this component
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useOwner } from "@/context/owner-context";
import { DeleteRoomDialog } from "@/components/rooms/delete-room-dialog";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

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
  
  // 1. New State for Row Selection
  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({});
  const [isBulkDeleting, setIsBulkDeleting] = React.useState(false);

  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const [roomToDelete, setRoomToDelete] = React.useState<any>(null);

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

  // --- Single Delete Logic (Existing) ---
  const initiateDelete = (room: any) => {
    setRoomToDelete(room);
    setDeleteOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!roomToDelete || !subdomain?.slug) return;

    const updatedRooms = rooms.filter(
      (r: any) => r.roomKey !== roomToDelete.roomKey
    );
    mutate(updatedRooms, false);

    try {
      await fetch(
        `/api/subdomain/${subdomain.slug}/room/${roomToDelete.roomKey}/crud`,
        { method: "DELETE" }
      );
      setDeleteOpen(false);
      setRoomToDelete(null);
      mutate();
      router.refresh();
    } catch (error) {
      console.error("Failed to delete room:", error);
      mutate();
    }
  };

  // --- Bulk Actions Logic (New) ---

  const handleBulkArchive = () => {
    // Placeholder for future logic
    const selectedCount = Object.keys(rowSelection).length;
    console.log(`Archiving ${selectedCount} items...`);
    alert("Archive logic coming soon!");
  };

  const handleBulkDelete = async () => {
    const selectedRoomKeys = Object.keys(rowSelection);
    if (!selectedRoomKeys.length || !subdomain?.slug) return;

    if (
      !confirm(
        `Are you sure you want to delete ${selectedRoomKeys.length} sessions? This cannot be undone.`
      )
    ) {
      return;
    }

    setIsBulkDeleting(true);

    // 1. Optimistic Update: Remove selected items immediately from UI
    const updatedRooms = rooms.filter(
      (r: any) => !rowSelection[r.roomKey]
    );
    mutate(updatedRooms, false);

    try {
      // 2. Perform concurrent delete requests
      await Promise.all(
        selectedRoomKeys.map((roomKey) =>
          fetch(`/api/subdomain/${subdomain.slug}/room/${roomKey}/crud`, {
            method: "DELETE",
          })
        )
      );

      // 3. Reset selection and re-sync
      setRowSelection({});
      mutate();
      router.refresh();
    } catch (error) {
      console.error("Bulk delete failed", error);
      mutate(); // Revert on error
    } finally {
      setIsBulkDeleting(false);
    }
  };

  // --- Table Configuration ---

  const columns: ColumnDef<any>[] = [
    // 2. New Selection Column
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
          className="translate-y-[2px]"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
          className="translate-y-[2px]"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
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
    // ... existing columns ...
    {
      accessorKey: "createdBy",
      header: "Created By",
      cell: ({ row }) => {
        const creator = row.original.creator;
        if (!creator) return <span className="text-muted-foreground">Unknown</span>;
        
        const initial = creator.name
          ? creator.name.charAt(0).toUpperCase()
          : creator.email.charAt(0).toUpperCase();

        return (
          <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src={creator.imageUrl} />
              <AvatarFallback>{initial}</AvatarFallback>
            </Avatar>
            <span className="text-sm">{creator.name || creator.email}</span>
          </div>
        );
      },
    },
    {
      accessorKey: "sessionType",
      header: ({ column }) => (
        <Button variant="ghost" className="-ml-4 h-8" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          Type <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => <span className="font-bold text-muted-foreground">{row.original.sessionType}</span>,
    },
    {
      id: "scopeCount",
      header: "Intel Captured",
      accessorFn: (row) => {
        const data = row.scopeData as any;
        return Array.isArray(data) ? data.length : data?.items?.length || 0;
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
          <Button variant="ghost" className="h-8 p-0" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
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
      accessorKey: "status",
      header: ({ column }) => (
        <div className="text-right">
           <Button variant="ghost" className="h-8 p-0" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
            Status <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        </div>
      ),
      cell: ({ row }) => <div className="text-center">{row.original.status}</div>
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
              <DropdownMenuItem onClick={() => router.push(`/my/rooms/${row.original.roomKey}`)}>
                <SquareArrowOutUpRight className="mr-2 h-4 w-4" /> View Session
              </DropdownMenuItem>
              <DropdownMenuItem variant="destructive" onClick={() => initiateDelete(row.original)}>
                <Trash2 className="mr-2 h-4 w-4" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    },
  ];

  const table = useReactTable({
    data: rooms || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onRowSelectionChange: setRowSelection, // 3. Bind selection handler
    getRowId: (row) => row.roomKey, // 4. Essential: Use roomKey as the ID for selection
    state: {
      sorting,
      rowSelection, // 5. Bind selection state
    },
  });

  const selectedCount = Object.keys(rowSelection).length;

  return (
    <div className="w-full space-y-4">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-lg font-bold tracking-tight">Session History</h2>
        
        {/* 6. Bulk Action Toolbar (appears when items are selected) */}
        {selectedCount > 0 ? (
          <div className="flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <span className="text-sm text-muted-foreground mr-2 border-r pr-4 border-zinc-300">
              {selectedCount} selected
            </span>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={handleBulkArchive}
              className="h-8 text-zinc-600"
            >
              <Archive className="mr-2 h-4 w-4" /> Archive
            </Button>
            <Button 
              size="sm" 
              variant="destructive" 
              onClick={handleBulkDelete}
              disabled={isBulkDeleting}
              className="h-8"
            >
              {isBulkDeleting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="mr-2 h-4 w-4" />
              )}
              Delete
            </Button>
          </div>
        ) : (
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Filter sessions..."
              className="pl-9 h-9 bg-white"
            />
          </div>
        )}
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
            {isLoading && !rooms.length ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  Loading sessions...
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className="hover:bg-zinc-50/50 transition-colors data-[state=selected]:bg-zinc-100"
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
                <TableCell colSpan={columns.length} className="h-24 text-center text-muted-foreground">
                  No sessions found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Mobile view omitted for brevity, but you would map 'rooms' manually there if needed */}
      <div className="grid grid-cols-1 gap-4 md:hidden">
         {/* Note: Checkboxes on mobile cards are tricky without changing layout heavily. 
             Ideally, you'd add a checkbox to the CardHeader here too. */}
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
        roomName={roomToDelete ? formatRoomName(roomToDelete.roomKey) : undefined}
      />
    </div>
  );
}