"use client";
import { useState, useMemo, useCallback } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  getPaginationRowModel, // 1. Import Pagination Model
  flexRender,
  createColumnHelper,
} from "@tanstack/react-table";
import {
  Search,
  ArrowUp,
  ArrowDown,
  Loader2,
  Camera,
  Database,
  Palette,
  Home,
  Building2,
  ChevronRight,
  ChevronLeft,
  Calendar,
  Clock,
  Logs,
  Info,
  Bot,
  Target,
} from "lucide-react";
import { BookingData } from "@/types/subdomain-type";
import { useDashboard } from "@/context/dashboard-context";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  formatCallReason,
  formatProjectScope,
  getEstimatedValueRange,
} from "@/lib/utils/dashboard-utils";
import { AudioPlayer } from "./audio-player";

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
  const { bookings, isLoading, openIntelligence, subdomain } = useDashboard();
  const [globalFilter, setGlobalFilter] = useState("");
  const [selectedBooking, setSelectedBooking] = useState<TableBooking | null>(
    null
  );
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  // Audio player state
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [isLoadingAudio, setIsLoadingAudio] = useState<string | null>(null);
  const [presignedUrls, setPresignedUrls] = useState<Record<string, string>>(
    {}
  );

  const handlePlayPause = useCallback(async (huelineId: string) => {
  // If already playing this one, just stop
  if (playingId === huelineId) {
    setPlayingId(null);
    return;
  }

  // If we already have a valid presigned URL, use it
  if (presignedUrls[huelineId]) {
    setPlayingId(huelineId);
    return;
  }

  // Fetch a new presigned URL
  try {
    setIsLoadingAudio(huelineId);
    const response = await fetch(
      `/api/subdomain/${subdomain.slug}/call/last?huelineId=${huelineId}`
    );
    const data = await response.json();

    if (data.url) {
      setPresignedUrls((prev) => ({ ...prev, [huelineId]: data.url }));
      setPlayingId(huelineId);
    }
  } catch (error) {
    console.error("Failed to fetch audio link", error);
  } finally {
    setIsLoadingAudio(null);
  }
}, [playingId, presignedUrls, subdomain.slug]);

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
      // Project Details (THE NEW LOGIC)
      columnHelper.display({
        id: "projectDetails",
        header: "Project Details",
        cell: (info) => {
          const row = info.row.original;

          // 1. ANCHOR: The Identity (Never Replaced)
          const anchor = formatCallReason(row.initialIntent || "NEW_PROJECT");

          // 2. TYPE: Explicit Text
          const rawType = row.projectType || "RESIDENTIAL";
          const typeLabel =
            rawType === "COMMERCIAL" ? "Commercial" : "Residential";
          const TypeIcon = rawType === "COMMERCIAL" ? Building2 : Home;
          const lastInteraction = row.lastInteraction;

          // 3. SCOPE: The Array (Join with comma)
          const scopeList =
            row.projectScope && row.projectScope.length > 0
              ? row.projectScope.join(", ")
              : "General Scope";

          return (
            <div className="flex flex-col py-1 max-w-[220px]">
              {/* LINE 1: Identity (New Project / Pricing / etc) */}
              <div className="font-bold text-gray-900 text-sm">{anchor}</div>

              {/* LINE 2: Type (Icon + Text) */}
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <TypeIcon className="size-3.5  shrink-0" />
                <span className="font-medium ">{typeLabel}</span>
              </div>
              {/* LINE 4: Scope (Icon + Text aligned) */}
              <div className="flex items-center gap-1.5 text-[10px] font-extrabold text-accent leading-snug break-words tracking-wide">
                <Target className="size-3.5  shrink-0" />
                <span>{scopeList}</span>
              </div>

              {/* LINE 3: Last Interaction */}
              <div className="flex items-center gap-1.5">
                <Bot className="size-3.5 text-purple-400 shrink-0" />
                <p className="text-xs text-purple-400">{lastInteraction}</p>
              </div>
            </div>
          );
        },
      }),

      // 2. ESTIMATED VALUE (Own Column)
      columnHelper.accessor("estimatedValue", {
        header: "Est. Value",
        cell: (info) => {
          const value = info.getValue() || 0;

          if (value === 0) {
            return <span className="text-gray-300 text-xs">-</span>;
          }

          return (
            <div className="font-bold text-emerald-500 text-sm">
              +{getEstimatedValueRange(value)}
            </div>
          );
        },
      }),

       columnHelper.accessor("lastCallAudioUrl", {
      header: "Recording",
      cell: (info) => {
        const row = info.row.original;
        const huelineId = row.huelineId;

        // Early return if no audio URL
        if (!row.lastCallAudioUrl) {
          return (
            <span className="text-xs text-gray-400 italic">No audio</span>
          );
        }

        // Pass null if we don't have a presigned URL yet
        const audioUrl = presignedUrls[huelineId] || null;

        return (
          <AudioPlayer
            url={audioUrl}
            isPlaying={playingId === huelineId}
            isLoading={isLoadingAudio === huelineId}
            onPlayPause={() => handlePlayPause(huelineId)}
          />
        );
      },
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
              className="h-8 w-8 inline-flex items-center justify-center rounded-md border border-blue-100 bg-blue-50 text-blue-600 hover:bg-blue-100 transition-all group"
              title="Open Client Portal"
            >
              <Palette className="w-4 h-4 group-hover:scale-110 transition-transform" />
            </Link>
          </div>
        ),
      }),
    ],
    [
    isLoading, 
    openIntelligence, 
    playingId, 
    isLoadingAudio, 
    presignedUrls,
    handlePlayPause // Add this too
  ]
  );

  const table = useReactTable({
    data: tableData,
    columns,
    state: { globalFilter },
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(), // 3. Enable Pagination
    initialState: {
      pagination: {
        pageSize: 10, // Default to 10 items per page
      },
    },
  });

  // Mobile Row Click Handler
  const handleMobileRowClick = (booking: TableBooking) => {
    setSelectedBooking(booking);
    setIsSheetOpen(true);
  };

  return (
    <div className="container mx-auto max-w-6xl px-4 lg:px-0 my-8">
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
            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-white"
          />
        </div>
      </div>

      {/* --- DESKTOP VIEW (unchanged structure) --- */}
      <div className="hidden md:block bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden mb-4">
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

      {/* --- MOBILE VIEW: COMPACT LIST --- */}
      <div className="md:hidden flex flex-col gap-0 border border-gray-200 rounded-xl bg-white overflow-hidden shadow-sm mb-4">
        {table.getRowModel().rows.map((row) => {
          const data = row.original;
          const thumbnailUrl = formatImageUrl(data.thumbnailUrl);
          const date = new Date(data.lastCallAt || data.createdAt);

          return (
            <div
              key={row.id}
              onClick={() => handleMobileRowClick(data)}
              className="flex items-center gap-3 p-3 border-b border-gray-100 last:border-0 active:bg-gray-50 transition-colors cursor-pointer"
            >
              {/* 1. Mini Thumbnail */}
              <div className="w-12 h-12 rounded-md bg-gray-100 shrink-0 overflow-hidden relative">
                {data.thumbnailUrl ? (
                  <Image
                    src={thumbnailUrl}
                    alt="Room"
                    fill
                    className="object-cover"
                  />
                ) : (
                  <Camera className="w-5 h-5 text-gray-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                )}
              </div>

              {/* 2. Main Info */}
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline mb-0.5">
                  <span className="font-semibold text-sm text-gray-900 truncate pr-2">
                    {data.name}
                  </span>
                  <span className="text-[10px] text-gray-400 shrink-0 bg-muted px-1 rounded-sm">
                    {date.toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                </div>
                <div className="flex items-center">
                  <div className="text-xs text-gray-500 truncate pr-2">
                    {data.projectType}
                  </div>
                  {data.estimatedValue && data.estimatedValue > 0 && (
                    <div className="text-[10px] font-bold text-green-600 bg-green-50 px-1.5 py-0.5 rounded">
                      ${data.estimatedValue}
                    </div>
                  )}
                </div>
              </div>

              {/* 3. Chevron Indicator */}
              <ChevronRight className="w-4 h-4 text-gray-300 shrink-0" />
            </div>
          );
        })}
      </div>

      {/* --- PAGINATION CONTROLS (Shared) --- */}
      <div className="flex items-center justify-between px-2">
        <div className="text-sm text-gray-500">
          Page {table.getState().pagination.pageIndex + 1} of{" "}
          {table.getPageCount()}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronLeft className="w-4 h-4 mr-1" /> Prev
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </div>

      {/* --- DETAIL SHEET (Mobile) --- */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent
          side="bottom"
          // 1. Added [&>button]:hidden to remove the default Shadcn 'X' icon
          // 2. Kept the premium rounded top and shadow
          className="h-[85vh] sm:h-full rounded-t-[2rem] sm:rounded-none outline-none border-t border-gray-100/50 shadow-[0_-8px_30px_-15px_rgba(0,0,0,0.1)] [&>button]:hidden p-0"
        >
          {selectedBooking && (
            <div className="flex flex-col h-full w-full bg-white rounded-t-[2rem]">
              {/* --- 1. GRAB HANDLE (Replaces Close Button) --- */}
              {/* This creates a safe zone at the top and signals "Swipe Down" */}
              <div
                className="w-full flex justify-center pt-3 pb-2 flex-shrink-0 cursor-grab active:cursor-grabbing"
                onClick={() => setIsSheetOpen(false)}
              >
                <div className="w-10 h-1.5 bg-gray-200 rounded-full hover:bg-gray-300 transition-colors" />
              </div>

              {/* --- PREMIUM HEADER --- */}
              <div className="px-6 pb-4 shrink-0">
                <div className="flex items-start justify-between mb-1">
                  <div>
                    <SheetTitle className="text-2xl font-bold tracking-tight text-gray-900">
                      {selectedBooking.name}
                    </SheetTitle>

                    {/* Metadata Row */}
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="font-mono text-[10px] uppercase tracking-wider bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-md border border-gray-200">
                        {selectedBooking.huelineId.slice(-6)}
                      </span>
                      <span className="text-gray-300 text-[10px]">•</span>
                      <div className="flex items-center gap-1 text-xs text-gray-500 font-medium">
                        <Clock className="w-3 h-3 text-gray-400" />
                        {new Date(
                          selectedBooking.lastCallAt ||
                            selectedBooking.createdAt
                        ).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                          hour: "numeric",
                          minute: "2-digit",
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Quick Action: Call Button (Now unobstructed) */}
                  <a
                    href={`tel:${selectedBooking.phone}`}
                    className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-50 text-blue-600 border border-blue-100 shadow-sm active:scale-95 transition-transform"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="w-4 h-4"
                    >
                      <path
                        fillRule="evenodd"
                        d="M1.5 4.5a3 3 0 013-3h1.372c.86 0 1.61.586 1.819 1.42l1.105 4.423a1.875 1.875 0 01-.694 1.955l-1.293.97c-.135.101-.164.249-.126.352a11.285 11.285 0 006.697 6.697c.103.038.25.009.352-.126l.97-1.293a1.875 1.875 0 011.955-.694l4.423 1.105c.834.209 1.42.959 1.42 1.82V19.5a3 3 0 01-3 3h-2.25C8.552 22.5 1.5 15.448 1.5 6.75V4.5z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </a>
                </div>
              </div>

              {/* --- SCROLLABLE CONTENT --- */}
              <div className="overflow-y-auto px-6 pb-32 space-y-6 flex-1">
                {/* Hero Visual */}
                <div className="aspect-[16/10] w-full relative bg-gray-50 rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
                  {selectedBooking.thumbnailUrl ? (
                    <Image
                      src={formatImageUrl(selectedBooking.thumbnailUrl)}
                      alt="Project"
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-gray-300">
                      <Camera className="w-8 h-8 mb-2 opacity-50" />
                      <span className="text-xs font-medium">No Preview</span>
                    </div>
                  )}
                  <div className="absolute bottom-3 left-3 px-2 py-1 bg-white/90 backdrop-blur-md rounded-md border border-white/20 text-[10px] font-semibold text-gray-700 shadow-sm">
                    Room Analysis
                  </div>
                </div>

                {/* Data Grid */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3.5 rounded-xl border border-gray-100 bg-white shadow-[0_2px_8px_-4px_rgba(0,0,0,0.05)]">
                    <div className="text-[10px] font-medium uppercase tracking-wider text-gray-400 mb-1.5">
                      Target Intent
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                      <div className="text-sm font-semibold text-gray-900 leading-none">
                        {formatCallReason(
                          selectedBooking.initialIntent || "General"
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl border border-gray-100 bg-white shadow-[0_2px_8px_-4px_rgba(0,0,0,0.05)]">
                    <div className="text-[10px] font-medium uppercase tracking-wider text-gray-400 mb-1.5">
                      Est. Opportunity
                    </div>
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-1.5 h-1.5 rounded-full ${
                          (selectedBooking.estimatedValue ?? 0) > 0
                            ? "bg-green-500"
                            : "bg-gray-300"
                        }`}
                      />
                      <div
                        className={`text-sm font-bold leading-none ${
                          (selectedBooking.estimatedValue ?? 0) > 0
                            ? "text-green-600"
                            : "text-gray-900"
                        }`}
                      >
                        {(selectedBooking.estimatedValue ?? 0) > 0
                          ? `+${getEstimatedValueRange(
                              selectedBooking.estimatedValue!
                            )}`
                          : "N/A"}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Audio */}
                {selectedBooking.lastCallAudioUrl && (
                  <div className="space-y-2">
                    <h4 className="text-xs font-medium text-gray-500 ml-1">
                      Voice Recording
                    </h4>
                    <div className="bg-white p-1 rounded-xl border border-gray-200 shadow-sm">
                      <AudioPlayer
                        url={presignedUrls[selectedBooking.huelineId] || null}
                        isPlaying={playingId === selectedBooking.huelineId}
                        isLoading={isLoadingAudio === selectedBooking.huelineId}
                        onPlayPause={() =>
                          handlePlayPause(selectedBooking.huelineId)
                        }
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* --- FOOTER --- */}
              <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-white via-white to-white/0 pt-10 rounded-b-none">
                <div className="grid grid-cols-[1fr_2fr] gap-3">
                  <Button
                    onClick={() => {
                      setIsSheetOpen(false);
                      openIntelligence(selectedBooking);
                    }}
                    variant="outline"
                    className="h-12 rounded-xl border-gray-200 text-gray-700 hover:bg-gray-50 hover:text-gray-900 font-medium"
                  >
                    <Database className="w-4 h-4 mr-2 text-purple-500" />
                    Intel
                  </Button>

                  <Link
                    href={`/j/${selectedBooking.huelineId}`}
                    // target="_blank"
                    className="w-full"
                  >
                    <Button className="w-full h-12 rounded-xl bg-gray-900 hover:bg-gray-800 text-white shadow-lg shadow-gray-200 font-medium">
                      <Palette className="w-4 h-4 mr-2" />
                      Open Studio
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
