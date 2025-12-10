"use client";

import { useState, useMemo, useRef } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  flexRender,
  createColumnHelper,
} from "@tanstack/react-table";
import {
  Search,
  ExternalLink,
  ArrowUp,
  ArrowDown,
  Play,
  Pause,
  FileAudio,
  Loader2,
  Camera,
  Link2,
} from "lucide-react";
import { BookingData } from "@/types/subdomain-type";
// 1. Import the hook from your provider
import { useDashboard } from "@/context/dashboard-context";
import Link from "next/link";
import Image from "next/image";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";

// --- Audio Player (No changes) ---
const AudioPlayer = ({ url }: { url: string }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  return (
    <div className="flex items-center gap-2">
      <audio
        ref={audioRef}
        src={url}
        onEnded={() => setIsPlaying(false)}
        className="hidden"
      />
      <button
        onClick={togglePlay}
        className={`p-2 rounded-full transition-all ${
          isPlaying
            ? "bg-blue-100 text-blue-600"
            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
        }`}
      >
        {isPlaying ? (
          <Pause className="w-4 h-4 fill-current" />
        ) : (
          <Play className="w-4 h-4 fill-current ml-0.5" />
        )}
      </button>
    </div>
  );
};

// Define type for table rows
type TableBooking = BookingData & {
  thumbnailUrl?: string;
  audioUrl?: string;
};

const columnHelper = createColumnHelper<TableBooking>();

// 2. Component no longer needs props!
export default function ClientTable() {
  // 3. Destructure values from your DashboardContext
  const { bookings, subdomain, isLoading } = useDashboard();

  // 4. Extract slug from the subdomain object in context
  const slug = subdomain.slug;

  const [globalFilter, setGlobalFilter] = useState("");

  // 5. Create table data mapping
  const tableData = useMemo(() => {
    return bookings.map((b) => ({
      ...b,
      // Priority: Presigned URL -> S3 Key -> Empty
      thumbnailUrl: b.mockups?.[0]?.presignedUrl || b.mockups?.[0]?.s3Key || "",
      audioUrl: (b as any).audioUrl || "", // Adjust based on your actual data shape
    }));
  }, [bookings]);

  const columns = useMemo(
    () => [
      // Preview / Thumbnail
      columnHelper.accessor("thumbnailUrl", {
        header: "Preview",
        cell: (info) => (
          <div className="w-12 h-12 rounded-md overflow-hidden bg-gray-100 border border-gray-200 relative flex items-center justify-center">
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
            ) : info.getValue() ? (
              <Image
                src={info.getValue()!}
                alt="Room"
                fill
                className="object-cover"
              />
            ) : (
              <Camera className="w-6 h-6 text-gray-400" />
            )}
          </div>
        ),
        enableSorting: false,
      }),

      // Date
      columnHelper.accessor("createdAt", {
        header: ({ column }) => (
          <button
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="flex items-center gap-1 font-semibold hover:text-gray-900"
          >
            Date{" "}
            {column.getIsSorted() === "asc" ? (
              <ArrowUp className="w-4 h-4" />
            ) : (
              <ArrowDown className="w-4 h-4" />
            )}
          </button>
        ),
        cell: (info) => {
          const date = new Date(info.getValue());
          return (
            <div className="text-sm font-medium text-gray-900">
              {date.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })}
              <div className="text-xs text-gray-500 font-normal">
                {date.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>
            </div>
          );
        },
      }),

      // Lead Details
      columnHelper.accessor("name", {
        header: "Lead Details",
        cell: (info) => {
          const prompt = info.row.original.prompt || "Consultation requested";
          const phone = info.row.original.phone;

          // Simple formatter
          const formatPhoneNumber = (phone: string) => {
            if (!phone) return "";
            const cleaned = phone.replace(/\D/g, "");
            if (cleaned.length === 11 && cleaned.startsWith("1"))
              return `+1 ${cleaned.slice(1)}`;
            return cleaned;
          };

          return (
            <div className="max-w-[200px]">
              <div className="font-semibold text-gray-900">
                {info.getValue()}
              </div>
              {phone && (
                <div className="text-muted-foreground text-sm font-normal">
                  {formatPhoneNumber(phone)}
                </div>
              )}
              <div className="text-xs text-gray-500" title={prompt}>
                {prompt}
              </div>
            </div>
          );
        },
      }),

      // Recording
      columnHelper.accessor("audioUrl", {
        header: "Recording",
        cell: (info) =>
          info.getValue() ? (
            <AudioPlayer url={info.getValue()!} />
          ) : (
            <span className="text-xs text-gray-400 italic">No audio</span>
          ),
        enableSorting: false,
      }),

      // Palette
      columnHelper.accessor("paintColors", {
        header: "Palette",
        cell: (info) => (
          <div className="flex -space-x-2 overflow-hidden">
            {info
              .getValue()
              ?.slice(0, 3)
              .map((color, idx) => (
                <div
                  key={idx}
                  className="w-6 h-6 rounded-full border border-white"
                  style={{ backgroundColor: color.hex }}
                  title={color.name}
                />
              )) || <span className="text-xs text-gray-400">-</span>}
          </div>
        ),
        enableSorting: false,
      }),

      // Link (Using the slug from context)
      columnHelper.accessor("huelineId", {
        header: "",
        cell: (info) => {
          const huelineId = info.row.original.huelineId;
          return (
            <Link
              // 6. Using the slug derived from context
              href={`/j/${huelineId}`}
              className="inline-flex items-center justify-center p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors group"
            >
              <ExternalLink className="w-4 h-4 group-hover:scale-110 transition-transform" />
            </Link>
          );
        },
        enableSorting: false,
      }),
    ],
    [slug, isLoading]
  );

  const table = useReactTable({
    data: tableData,
    columns,
    state: { globalFilter },
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <div className="container mx-auto max-w-6xl px-4 md:px-10 lg:px-0 my-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold text-gray-900">Lead Feed</h2>
            {isLoading && (
              <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
            )}
          </div>
          <p className="text-sm text-gray-500">
            Real-time incoming calls and AI visualizations.
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={globalFilter ?? ""}
            onChange={(e) => setGlobalFilter(e.target.value)}
            placeholder="Search leads..."
            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-white"
          />
        </div>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50/50 border-b border-gray-200">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider"
                  >
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-gray-100">
            {table.getRowModel().rows.map((row) => (
              <tr
                key={row.id}
                className="hover:bg-gray-50/80 transition-colors"
              >
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-6 py-4 whitespace-nowrap">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-3">
        {table.getRowModel().rows.map((row) => {
          const data = row.original;
          return (
            <div
              key={row.id}
              className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm flex gap-4"
            >
              <div className="w-16 h-16 rounded-lg bg-gray-100 shrink-0 overflow-hidden relative flex items-center justify-center">
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                ) : data.thumbnailUrl ? (
                  <Image
                    src={data.thumbnailUrl}
                    alt="Room"
                    fill
                    className="object-cover"
                  />
                ) : (
                  <Camera className="w-6 h-6 text-gray-400" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex-col justify-between items-start">
                  <div className="flex justify-between">
                    <div>
                      <div className="font-semibold text-gray-900">
                        {data.name}
                      </div>
                      <div className="text-muted-foreground text-xs font-normal">
                        {data.phone}
                      </div>
                    </div>
                    <Button
                    size="sm"
                    variant="outline" 
                    
                    asChild>
                    <Link href={`/j/${data.huelineId}`}>
                     <span className="text-xs"> View </span>
                    </Link>
                    </Button>
                  </div>
                  <Separator />
                  <div className="text-muted-foreground text-xs font-normal mt-2">
                    {data.prompt}
                  </div>
                  {data.audioUrl && <AudioPlayer url={data.audioUrl} />}
                </div>

                <div className="flex items-center justify-between mt-2">
                  <div className="flex -space-x-1">
                    {data.paintColors?.slice(0, 3).map((c, i) => (
                      <div
                        key={i}
                        className="w-4 h-4 rounded-full border border-white"
                        style={{ background: c.hex }}
                      />
                    ))}
                  </div>
                  <div className="text-xs text-gray-400">
                    {new Date(data.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {tableData.length === 0 && !isLoading && (
        <div className="text-center py-20 bg-white rounded-xl border border-gray-200 border-dashed">
          <div className="p-3 bg-gray-50 rounded-full w-fit mx-auto mb-3">
            <FileAudio className="w-6 h-6 text-gray-400" />
          </div>
          <h3 className="text-gray-900 font-medium">No leads yet</h3>
          <p className="text-gray-500 text-sm mt-1">
            Incoming calls will appear here automatically.
          </p>
        </div>
      )}
    </div>
  );
}
