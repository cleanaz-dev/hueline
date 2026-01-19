"use client";
import { useState, useMemo, useCallback } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  getPaginationRowModel,
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
  Bot,
  Target,
  Phone,
  Film,
} from "lucide-react";
import { BookingData } from "@/types/subdomain-type";
import { useDashboard } from "@/context/dashboard-context";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  formatCallReason,
  getEstimatedValueRange,
} from "@/lib/utils/dashboard-utils";
import { AudioPlayer } from "./audio-player";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogTitle,
} from "@/components/ui/dialog";
import { SecureVideoPlayer } from "@/components/rooms/video/secure-video-player";
import { ClientTableMobile } from "./client-table-mobile";

// EXPORT Helper for use in Mobile Component
export const formatImageUrl = (url: string | null | undefined): string => {
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

// EXPORT Type for use in Mobile Component
export type TableBooking = BookingData & {
  thumbnailUrl: string;
  totalHiddenValue: number;
  rooms?: {
    roomKey: string;
    recordingUrl?: string | null;
  }[];
};

const columnHelper = createColumnHelper<TableBooking>();

export default function ClientTable() {
  const { bookings, isLoading, openIntelligence, subdomain } = useDashboard();
  const [globalFilter, setGlobalFilter] = useState("");

  // Audio player state
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [isLoadingAudio, setIsLoadingAudio] = useState<string | null>(null);
  const [presignedUrls, setPresignedUrls] = useState<Record<string, string>>(
    {},
  );
  // videoOpenId state was unused in original logic provided, but keeping if needed for extensions
  const [videoOpenId, setVideoOpenId] = useState<string | null>(null);

  const handlePlayPause = useCallback(
    async (huelineId: string) => {
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
          `/api/subdomain/${subdomain.slug}/call/last?huelineId=${huelineId}`,
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
    },
    [playingId, presignedUrls, subdomain.slug],
  );

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
          0,
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
                  className="object-cover"
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
              ) : (
                <Camera className="w-6 h-6 text-gray-400" />
              )}
            </div>
          );
        },
      }),

      // Date
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

      // Project Details
      columnHelper.display({
        id: "projectDetails",
        header: "Project Details",
        cell: (info) => {
          const row = info.row.original;
          const anchor = formatCallReason(row.initialIntent || "NEW_PROJECT");
          const rawType = row.projectType || "RESIDENTIAL";
          const typeLabel =
            rawType === "COMMERCIAL" ? "Commercial" : "Residential";
          const TypeIcon = rawType === "COMMERCIAL" ? Building2 : Home;
          const lastInteraction = row.lastInteraction;

          const scopeList =
            row.projectScope && row.projectScope.length > 0
              ? row.projectScope.join(", ")
              : "General Scope";

          return (
            <div className="flex flex-col py-1 max-w-[220px]">
              <div className="font-bold text-gray-900 text-sm">{anchor}</div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <TypeIcon className="size-3.5  shrink-0" />
                <span className="font-medium ">{typeLabel}</span>
              </div>
              <div className="flex items-center gap-1.5 text-[10px] font-extrabold text-accent leading-snug break-words tracking-wide">
                <Target className="size-3.5  shrink-0" />
                <span>{scopeList}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Bot className="size-3.5 text-purple-400 shrink-0" />
                <p className="text-xs text-purple-400">{lastInteraction}</p>
              </div>
            </div>
          );
        },
      }),

      // Estimated Value
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

      // Media
      columnHelper.display({
        id: "media",
        header: "Media",
        cell: (info) => {
          const row = info.row.original;
          const huelineId = row.huelineId;

          const audioUrl = row.lastCallAudioUrl;
          const firstRoom = row.rooms?.[0];
          const recordingUrl = firstRoom?.recordingUrl;
          const roomKey = firstRoom?.roomKey;

          const baseButtonClass =
            "w-8 h-8 rounded-full flex items-center justify-center border transition-all duration-200";

          return (
            <div className="flex items-center gap-2">
              {audioUrl ? (
                <div className="w-8 h-8 flex items-center justify-center ">
                  <AudioPlayer
                    url={presignedUrls[huelineId] || null}
                    isPlaying={playingId === huelineId}
                    isLoading={isLoadingAudio === huelineId}
                    onPlayPause={() => handlePlayPause(huelineId)}
                  />
                </div>
              ) : (
                <div
                  className={`${baseButtonClass} bg-gray-50 border-transparent text-gray-300 lowed`}
                  title="No call recording"
                >
                  <Phone className="w-3.5 h-3.5" />
                </div>
              )}

              {recordingUrl && roomKey ? (
                <Dialog>
                  <DialogTrigger asChild>
                    <button
                      className={`${baseButtonClass} bg-white border-accent/15 text-accent/50 hover:bg-primary/10 hover:border-primary/10 active:scale-95 cursor-pointer`}
                      title="Watch Session Film"
                    >
                      <Film className="w-3.5 h-3.5" />
                    </button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-4xl p-0 overflow-hidden bg-black border-zinc-800">
                    <DialogTitle sr-only="video" />
                    <div className="aspect-video w-full">
                      <SecureVideoPlayer
                        roomId={roomKey}
                        className="w-full h-full rounded-none"
                      />
                    </div>
                  </DialogContent>
                </Dialog>
              ) : (
                <div
                  className={`${baseButtonClass} bg-gray-50 border-transparent text-gray-300 `}
                  title="No video recording"
                >
                  <Film className="w-3.5 h-3.5" />
                </div>
              )}
            </div>
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
            <button
              onClick={() => openIntelligence(info.row.original)}
              className="h-8 w-8 inline-flex items-center justify-center rounded-md border border-purple-100 bg-purple-50 text-purple-600 hover:bg-purple-100 transition-all group cursor-pointer"
              title="View Intelligence & Logs"
            >
              <Database className="w-4 h-4 group-hover:scale-110 transition-transform" />
            </button>

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
      handlePlayPause,
    ],
  );

  const table = useReactTable({
    data: tableData,
    columns,
    state: { globalFilter },
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  });

  return (
    <div className="container mx-auto max-w-7xl px-4 lg:px-0 my-8">
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

      {/* --- DESKTOP VIEW --- */}
      <div className="hidden md:block bg-white rounded-xl border border-gray-200 shadow-sm mb-4">
        <div className="overflow-x-auto w-full">
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
                        header.getContext(),
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
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- MOBILE VIEW COMPONENT --- */}
      <ClientTableMobile
        table={table}
        formatImageUrl={formatImageUrl}
        openIntelligence={openIntelligence}
      />

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
    </div>
  );
}
