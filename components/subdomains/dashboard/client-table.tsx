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
  Loader2,
  Camera,
  Database,
  Palette,
  Home,
  Building2,
} from "lucide-react";
import { BookingData } from "@/types/subdomain-type";
import { useDashboard } from "@/context/dashboard-context";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  formatCallReason,
  formatProjectScope,
  getEstimatedValueRange,
} from "@/lib/utils/dashboard-utils";

// --- Audio Player ---
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

const formatImageUrl = (url: string | null | undefined): string => {
  if (!url) return "";

  // 1. If it's already an absolute HTTP/HTTPS URL, return it
  if (url.startsWith("http://") || url.startsWith("https://")) return url;

  // 2. Clean up the path to prevent "//" or "/subdomains//subdomains"
  // Remove ALL leading slashes first
  const cleanPath = url.replace(/^\/+/, "");

  // 3. Remove accidental double slashes inside the path (optional but safe)
  const sanitizedPath = cleanPath.replace(/\/\//g, "/");

  // 4. Return with exactly one leading slash
  return `/${sanitizedPath}`;
};

// 1. UPDATE TYPE
// We only need to add the calculated Total Value. Everything else is on BookingData now.
type TableBooking = BookingData & {
  thumbnailUrl: string;
  totalHiddenValue: number;
};

const columnHelper = createColumnHelper<TableBooking>();

export default function ClientTable() {
  const { bookings, isLoading, openIntelligence } = useDashboard();
  const [globalFilter, setGlobalFilter] = useState("");

  // 2. SIMPLIFIED DATA TRANSFORM
  const tableData = useMemo(() => {
    if (!bookings) return [];
    return bookings.map((b) => {
      // 1. Try to get the first Mockup URL
      let thumb = b.mockups?.[0]?.presignedUrl;

      // 2. Fallback: If no mockup, use the first Original Image URL
      if (!thumb && b.originalImages && b.originalImages.length > 0) {
        // Check if it's a full URL (presigned) or just a Key
        const img = b.originalImages[0];
        if (img.startsWith("http")) thumb = img;
      }

      return {
        ...b,
        thumbnailUrl: thumb || "",
        totalHiddenValue: (b.calls || []).reduce(
          (sum, call) =>
            sum + (call.intelligence?.estimatedAdditionalValue || 0),
          0
        ),
      };
    });
  }, [bookings]);

  const columns = useMemo(
    () => [
      // Preview
      columnHelper.accessor("thumbnailUrl", {
        header: "Preview",
        cell: (info) => {
          const rawThumbnailUrl = info.row.original.thumbnailUrl;
          const thumbnailUrl = formatImageUrl(rawThumbnailUrl);
          return (
            <div className="w-12 h-12 rounded-md overflow-hidden bg-gray-100 border border-gray-200 relative flex items-center justify-center">
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
              ) : info.getValue() ? (
                <Image
                  src={thumbnailUrl}
                  alt="Room"
                  fill
                  className="object-cover"
                />
              ) : (
                <Camera className="w-6 h-6 text-gray-400" />
              )}
            </div>
          );
        },
      }),

      // Date (Now using lastCallAt to sort by activity)
      columnHelper.accessor("lastCallAt", {
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
          // Fallback to createdAt if lastCallAt is missing (for legacy data)
          const val = info.getValue() || info.row.original.createdAt;
          const date = new Date(val);
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
        cell: (info) => (
          <div className="max-w-[200px]">
            <div className="font-semibold text-gray-900">{info.getValue()}</div>
            <div className="text-muted-foreground text-sm font-normal">
              {info.row.original.phone}
            </div>
            <div className="text-xs text-gray-500 truncate">
              {info.row.original.prompt}
            </div>
          </div>
        ),
      }),

      // Project Details (THE NEW LOGIC)
      columnHelper.display({
        id: "projectDetails",
        header: "Project Details",
        cell: (info) => {
          // 1. DATA
          const anchor = info.row.original.initialIntent || "NEW_PROJECT";
          const current = info.row.original.currentCallReason;
          const scope = info.row.original.currentProjectScope;
          // Assuming you named the field 'currentProjectType' or 'projectType'
          const type =
            (info.row.original as any).projectType || "RESIDENTIAL";

          const showPulse = current && current !== anchor;

          // 2. ICON SELECTION
          const TypeIcon = type === "COMMERCIAL" ? Building2 : Home;

          return (
            <div className="flex flex-col gap-1 max-w-[180px]">
              {/* LINE 1: Identity (Reason) */}
              <div className="flex  gap-2 font-semibold text-gray-900 text-sm">
                {formatCallReason(anchor)}
                
              {showPulse && (
                <div className="flex">
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-blue-50 text-muted-foreground border border-blue-100">
                    Latest: {formatCallReason(current!)}
                  </span>
                </div>
              )}

              </div>

        
              {/* LINE 3: Type & Scope (The Visual Story) */}
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                {/* The Icon (Visual Anchor) */}
                <TypeIcon className="size-4 text-gray-400" />

                {/* The Scope */}
                <span>{formatProjectScope(scope || "UNKNOWN")}</span>
              </div>

              {/* LINE 4: Money */}
              {info.row.original.totalHiddenValue > 0 && (
                <div className="text-xs text-green-600 font-bold mt-0.5">
                  +{getEstimatedValueRange(info.row.original.totalHiddenValue)}{" "}
                  Value
                </div>
              )}
            </div>
          );
        },
      }),

      // Recording (Read directly from Parent)
      columnHelper.accessor("lastCallAudioUrl", {
        header: "Recording",
        cell: (info) =>
          info.getValue() ? (
            <AudioPlayer url={info.getValue()!} />
          ) : (
            <span className="text-xs text-gray-400 italic">No audio</span>
          ),
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
      }),

      // Link
      columnHelper.accessor("huelineId", {
        header: "",
        cell: (info) => (
          <div className="flex items-center justify-end gap-2">
            {/* 1. INTELLIGENCE (The Business) - Purple */}
            <button
              onClick={() => openIntelligence(info.row.original)}
              className="h-8 w-8 inline-flex items-center justify-center rounded-md border border-purple-100 bg-purple-50 text-purple-600 hover:bg-purple-100 transition-all group cursor-pointer"
              title="View Intelligence & Logs"
            >
              <Database className="w-4 h-4 group-hover:scale-110 transition-transform" />
            </button>

            {/* 2. VISUALS (The Art) - Blue */}
            <Link
              href={`/j/${info.getValue()}`}
              target="_blank" // Opens Client Portal in new tab
              className="h-8 w-8 inline-flex items-center justify-center rounded-md border border-blue-100 bg-blue-50 text-blue-600 hover:bg-blue-100 transition-all group"
              title="Open Client Portal"
            >
              <Palette className="w-4 h-4 group-hover:scale-110 transition-transform" />
            </Link>
          </div>
        ),
      }),
    ],
    [isLoading, openIntelligence] // Add openIntelligence dependency
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
    <div className="container mx-auto max-w-6xl px-4  lg:px-0 my-12">
      {/* Search Header */}
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
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={globalFilter ?? ""}
            onChange={(e) => setGlobalFilter(e.target.value)}
            placeholder="Search leads..."
            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-card"
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

      {/* Mobile View */}
      <div className="md:hidden space-y-3">
        {table.getRowModel().rows.map((row) => {
          const data = row.original;
          // console.log("row data:", data)
          // Clean Mobile Data Access
          const anchor = data.initialIntent || "NEW_PROJECT";
          const current = data.currentCallReason;
          const showPulse = current && current !== anchor;
          const rawThumbnailUrl = row.original.thumbnailUrl;
          const thumbnailUrl = formatImageUrl(rawThumbnailUrl);
          console.log(
            "Mobile thumbnailUrl:",
            thumbnailUrl,
            "Raw:",
            rawThumbnailUrl
          );
          return (
            <div
              key={row.id}
              className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm flex gap-4"
            >
              <div className="w-16 h-16 rounded-lg bg-gray-100 shrink-0 overflow-hidden relative flex items-center justify-center">
                {data.thumbnailUrl ? (
                  <Image
                    src={thumbnailUrl}
                    alt="Room"
                    fill
                    className="object-cover"
                  />
                ) : (
                  <Camera className="w-6 h-6 text-gray-400" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <div className="font-semibold text-gray-900">
                      {data.name}
                      {""}{" "}
                      <span className="text-[10px] text-gray-400 font-mono mt-0.5">
                        {data.huelineId}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {data.phone}
                    </div>
                  </div>

                  {/* ACTION BUTTONS */}
                  <div className="flex gap-2">
                    {/* 1. INTELLIGENCE (Database) */}
                    <button
                      onClick={() => openIntelligence(data)}
                      className="h-9 w-9 flex items-center justify-center rounded-lg border border-purple-100 bg-purple-50 text-purple-600 hover:bg-purple-100 transition-colors"
                      title="View Intelligence"
                    >
                      <Database className="w-4 h-4" />
                    </button>

                    {/* 2. VISUALS (Palette) */}
                    <Link
                      href={`/j/${data.huelineId}`}
                      className="h-9 w-9 flex items-center justify-center rounded-lg border border-blue-100 bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                      title="View Mockups & Colors"
                    >
                      <Palette className="w-4 h-4" />
                    </Link>
                  </div>
                </div>

                <Separator className="my-2" />

                {/* Project Details Mobile */}
                <div className="grid grid-cols-2 gap-2 mb-2">
                  <div>
                    <div className="text-xs font-medium text-gray-700">
                      {formatCallReason(anchor)}
                    </div>
                    {showPulse && (
                      <div className="text-[10px] text-blue-600 mt-0.5">
                        Latest: {formatCallReason(current!)}
                      </div>
                    )}
                  </div>
                  {data.totalHiddenValue > 0 && (
                    <div>
                      <div className="text-[10px] text-gray-400 uppercase">
                        Approx. Value
                      </div>
                      <div className="text-xs font-bold text-green-600">
                        +{getEstimatedValueRange(data.totalHiddenValue)}
                      </div>
                    </div>
                  )}
                </div>

                {data.lastCallAudioUrl && (
                  <AudioPlayer url={data.lastCallAudioUrl} />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
