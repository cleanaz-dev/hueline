"use client";

import { useMemo, useState } from "react";
import { useOwner } from "@/context/owner-context";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  flexRender,
  ColumnDef,
  SortingState,
  ColumnFiltersState,
  Row,
} from "@tanstack/react-table";
import { 
  Search, Play, Pause, ChevronLeft, ChevronRight, 
  ArrowUp, ArrowDown, Phone, X, 
  AlertTriangle, DollarSign, ListFilter, ChevronDown, ChevronUp,
  IdCard,
  Hash
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Helper for mobile date formatting
const formatDateMobile = (dateStr: string) => {
  const d = new Date(dateStr);
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
};

export default function SubdomainCallsPage() {
  const { subdomain } = useOwner();
  
  // --- STATE ---
  const [globalFilter, setGlobalFilter] = useState("");
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [sorting, setSorting] = useState<SortingState>([{ id: "createdAt", desc: true }]);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"ALL" | "RISK" | "OPPORTUNITY">("ALL");

  // --- 1. DEFINE COLUMNS (Desktop) ---
  const columns = useMemo<ColumnDef<any>[]>(
    () => [
      {
        header: "Caller Details",
        accessorFn: (row) => row.bookingData?.name,
        cell: ({ row }) => (
          <div className="max-w-[200px]">
            <div className="font-semibold text-gray-900 truncate flex gap-2 items-center text-sm">
                <IdCard className="size-4 opacity-70 text-gray-500" />
              {row.original.bookingData?.name || "Unknown Caller"}
            </div>
            <div className="text-xs text-gray-500 font-normal flex items-center mt-0.5">
              <Phone className="w-3 h-3 mr-1 opacity-70" />
              {row.original.bookingData?.phone || "-"}
            </div>
            <div className="text-xs text-gray-500 flex items-center gap-1 italic">
            <Hash className="size-3 opacity-70 text-gray-500" />{row.original.intelligence.callId.slice(0,8)}
            </div>
          </div>
        ),
      },
      {
        accessorKey: "intelligence.callReason", 
        header: "Intent",
        cell: ({ row }) => {
          const reason = row.original.intelligence?.callReason?.replace("_", " ") || "OTHER";
          return (
            <div className="flex items-center">
              <span className="inline-flex items-center px-2 py-1 rounded text-[10px] font-medium bg-gray-100 text-gray-600 border border-gray-200 uppercase tracking-wide">
                {reason}
              </span>
            </div>
          );
        },
      },
      {
        header: "Value",
        accessorFn: (row) => row.intelligence?.estimatedAdditionalValue,
        cell: ({ getValue }) => {
          const val = getValue() as number;
          if (!val || val === 0) return <span className="text-xs text-gray-300 font-medium">-</span>;
          return (
            <div className="flex items-center">
              <span className="text-xs font-bold text-green-700 bg-green-50 px-2 py-1 rounded-md border border-green-100">
                +${val.toLocaleString()}
              </span>
            </div>
          );
        },
      },
      {
        accessorKey: "intelligence.callOutcome",
        header: "Sentiment",
        cell: ({ getValue }) => <OutcomeBadge outcome={getValue() as string} />,
      },
      {
        header: "Summary",
        accessorFn: (row) => row.intelligence?.callSummary,
        cell: ({ getValue }) => (
          <p className="text-xs text-gray-600 line-clamp-2 max-w-46 font-normal leading-relaxed truncate" title={getValue() as string}>
            {getValue() as string || <span className="text-gray-400 italic">Processing...</span>}
          </p>
        ),
        meta: { className: "hidden lg:table-cell" },
      },
      {
        id: "createdAt",
        accessorKey: "createdAt",
        header: ({ column }) => (
          <button
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="flex items-center gap-1 font-semibold hover:text-gray-900"
          >
            Date
            {column.getIsSorted() === "asc" ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
          </button>
        ),
        cell: ({ getValue }) => {
          const date = new Date(getValue() as string);
          return (
            <div className="text-sm font-medium text-gray-900">
              {date.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
              <div className="text-xs text-gray-500 font-normal">
                {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          );
        },
        meta: { className: "hidden sm:table-cell" },
      },
      {
        id: "actions",
        header: "Audio",
        cell: ({ row }) => {
          const call = row.original;
          if (!call.audioUrl) return <span className="text-xs text-gray-400 italic">No audio</span>;
          const isPlaying = playingId === call.id;

          return (
            <div className="flex items-center">
              <button
                onClick={() => setPlayingId(isPlaying ? null : call.id)}
                className={cn(
                  "flex items-center justify-center w-8 h-8 rounded-full border transition-all active:scale-95",
                  isPlaying 
                    ? "bg-blue-50 border-blue-200 text-blue-600 shadow-inner" 
                    : "bg-white border-gray-200 text-gray-400 hover:text-gray-700 hover:border-gray-300 shadow-sm"
                )}
              >
                {isPlaying ? <Pause size={12} fill="currentColor" /> : <Play size={12} fill="currentColor" className="ml-0.5" />}
              </button>
              {isPlaying && (
                <audio src={call.audioUrl} autoPlay onEnded={() => setPlayingId(null)} className="hidden" />
              )}
            </div>
          );
        },
      },
    ],
    [playingId]
  );

  // --- 2. DATA FILTERING ---
  const activeData = useMemo(() => {
    switch (activeTab) {
      case "RISK":
        return subdomain.calls.filter(c => c.intelligence?.callOutcome === "NEGATIVE");
      case "OPPORTUNITY":
        return subdomain.calls.filter(c => 
          c.intelligence?.callOutcome === "POSITIVE" || 
          (c.intelligence?.estimatedAdditionalValue || 0) > 0
        );
      default:
        return subdomain.calls;
    }
  }, [subdomain.calls, activeTab]);

  const table = useReactTable({
    data: activeData,
    columns,
    state: { globalFilter, sorting, columnFilters },
    onGlobalFilterChange: setGlobalFilter,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 10 } }
  });

  return (
   <div className="my-room-container">
      
      {/* --- HEADER SECTION --- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-6">
        <div>
          <div className="flex items-center gap-3">
             <h2 className="text-2xl font-bold text-gray-900">Calls</h2>
             <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs font-semibold border border-gray-200">
                {subdomain.calls.length}
             </span>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Analyze conversations, identify risks, and spot revenue opportunities.
          </p>
          
          {/* TABS (Styled as Filters) */}
          <div className="flex items-center gap-2 mt-4">
             <TabButton 
                active={activeTab === "ALL"} 
                onClick={() => setActiveTab("ALL")} 
                label="All Calls"
                icon={<ListFilter className="w-3.5 h-3.5" />}
             />
             <TabButton 
                active={activeTab === "RISK"} 
                onClick={() => setActiveTab("RISK")} 
                label="Risk Alerts"
                icon={<AlertTriangle className="w-3.5 h-3.5" />}
                activeClass="bg-red-50 text-red-700 border-red-200"
             />
             <TabButton 
                active={activeTab === "OPPORTUNITY"} 
                onClick={() => setActiveTab("OPPORTUNITY")} 
                label="Opportunities"
                icon={<DollarSign className="w-3.5 h-3.5" />}
                activeClass="bg-green-50 text-green-700 border-green-200"
             />
          </div>
        </div>

        {/* SEARCH */}
        <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
            <div className="relative w-full md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                    type="text"
                    value={globalFilter ?? ""}
                    onChange={(e) => setGlobalFilter(e.target.value)}
                    placeholder="Search transcripts..."
                    className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-white"
                />
            </div>
            {(globalFilter || activeTab !== 'ALL') && (
                <button 
                  onClick={() => {
                      setGlobalFilter("");
                      setActiveTab("ALL");
                  }}
                  className="px-3 py-2 text-sm text-gray-500 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center"
                >
                  <X className="w-4 h-4" />
                </button>
            )}
        </div>
      </div>

      {/* --- DESKTOP TABLE VIEW --- */}
      <div className="hidden md:block bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden mb-4">
        <table className="w-full">
          <thead className="bg-gray-50/50 border-b border-gray-200">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                   const metaClass = (header.column.columnDef.meta as any)?.className ?? "";
                   return (
                    <th
                        key={header.id}
                        className={cn("px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider", metaClass)}
                    >
                        {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    </th>
                   );
                })}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-gray-100">
            {table.getRowModel().rows.length === 0 ? (
                <tr>
                    <td colSpan={columns.length} className="px-6 py-12 text-center text-gray-500">
                        <div className="flex flex-col items-center justify-center gap-2">
                             <div className="p-3 bg-gray-50 rounded-full">
                                <Search className="w-6 h-6 text-gray-400" />
                             </div>
                             <p>No calls found matching your criteria.</p>
                        </div>
                    </td>
                </tr>
            ) : (
                table.getRowModel().rows.map((row) => (
                <tr key={row.id} className="hover:bg-gray-50/80 transition-colors">
                    {row.getVisibleCells().map((cell) => {
                        const metaClass = (cell.column.columnDef.meta as any)?.className ?? "";
                        return (
                            <td key={cell.id} className={cn("px-6 py-4 whitespace-nowrap", metaClass)}>
                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                            </td>
                        );
                    })}
                </tr>
                ))
            )}
          </tbody>
        </table>
      </div>

      {/* --- MOBILE LIST VIEW (Expanded Card Style) --- */}
      <div className="md:hidden flex flex-col gap-3 mb-6">
        {table.getRowModel().rows.length === 0 ? (
            <div className="p-8 text-center text-gray-500 text-sm border border-gray-200 rounded-xl bg-white">
                No calls found.
            </div>
        ) : (
            table.getRowModel().rows.map((row) => (
                <MobileCallCard 
                    key={row.id} 
                    row={row} 
                    isPlaying={playingId === row.original.id}
                    onPlayToggle={() => setPlayingId(playingId === row.original.id ? null : row.original.id)}
                />
            ))
        )}
      </div>

      {/* --- PAGINATION (Shared) --- */}
      <div className="flex items-center justify-between px-2">
        <div className="text-sm text-gray-500">
          Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount() +1}
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

// --- SUB-COMPONENTS ---

function MobileCallCard({ row, isPlaying, onPlayToggle }: { row: Row<any>, isPlaying: boolean, onPlayToggle: () => void }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const data = row.original;
  const reason = data.intelligence?.callReason?.replace("_", " ") || "OTHER";

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden transition-all duration-200">
       {/* Main Row */}
       <div className="p-4 flex items-start gap-3">
          {/* Play Button */}
          <button
              onClick={(e) => {
                  e.stopPropagation();
                  onPlayToggle();
              }}
              className={cn(
              "shrink-0 flex items-center justify-center w-10 h-10 rounded-full border transition-all mt-1",
              isPlaying 
                  ? "bg-blue-50 border-blue-200 text-blue-600 ring-2 ring-blue-100" 
                  : "bg-gray-50 border-gray-200 text-gray-400 hover:text-gray-700"
              )}
          >
              {isPlaying ? <Pause size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" className="ml-0.5" />}
          </button>
          {isPlaying && (
              <audio src={data.audioUrl} autoPlay onEnded={onPlayToggle} className="hidden" />
          )}

          {/* Info Area */}
          <div className="flex-1 min-w-0">
             <div className="flex justify-between items-start">
                 <div>
                    <h4 className="font-semibold text-gray-900 text-sm truncate pr-2">
                        {data.bookingData?.name || "Unknown Caller"}
                    </h4>
                    <div className="flex items-center text-xs text-gray-500 mt-0.5">
                        <Phone className="w-3 h-3 mr-1" />
                        {data.bookingData?.phone || "No Number"}
                    </div>
                 </div>
                 <span className="text-[10px] font-medium text-gray-400 shrink-0 bg-gray-50 px-1.5 py-0.5 rounded border border-gray-100">
                    {formatDateMobile(data.createdAt)}
                 </span>
             </div>

             <div className="flex items-center gap-2 mt-3">
                <OutcomeBadge outcome={data.intelligence?.callOutcome} />
                  <div className="inline-flex items-center px-2 py-1 rounded text-[10px] font-bold bg-white text-gray-600 border border-gray-200 uppercase tracking-wide shadow-sm">
                      {reason}
                   </div>
                
                {/* Spacer */}
                <div className="flex-1" />

                {/* Expansion Toggle */}
                <button 
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="flex items-center text-xs font-medium text-blue-600 active:text-blue-800"
                >
                    {isExpanded ? "Close" : "Summary"}
                    {isExpanded ? <ChevronUp className="w-3 h-3 ml-1" /> : <ChevronDown className="w-3 h-3 ml-1" />}
                </button>
             </div>
          </div>
       </div>

       {/* Expanded Details */}
       {isExpanded && (
           <div className="bg-gray-50/50 border-t border-gray-100 px-4 py-3 text-sm animate-in slide-in-from-top-2 duration-200">
               {/* Metadata Grid */}
               <div className="flex items-center gap-3 mb-3">
                 
                   {(data.intelligence?.estimatedAdditionalValue || 0) > 0 && (
                      <div className="inline-flex items-center px-2 py-1 rounded text-[10px] font-bold bg-green-100 text-green-700 border border-green-200 shadow-sm">
                         +${data.intelligence?.estimatedAdditionalValue} Value
                      </div>
                   )}
               </div>

               {/* Summary Text */}
               <div>
                  <h5 className="text-[10px] uppercase text-gray-400 font-bold tracking-wider mb-1">Summary</h5>
                  <p className="text-gray-700 leading-relaxed text-xs">
                    {data.intelligence?.callSummary || "No summary available for this call."}
                  </p>
               </div>
           </div>
       )}
    </div>
  );
}

function TabButton({ active, onClick, label, icon, activeClass = "bg-gray-900 text-white border-gray-900" }: any) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium border transition-all shadow-sm",
        active 
          ? activeClass
          : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50 hover:border-gray-300"
      )}
    >
      {icon}
      {label}
    </button>
  );
}

function OutcomeBadge({ outcome, mini = false }: { outcome: string | null | undefined, mini?: boolean }) {
  if (!outcome) return <span className="text-xs text-gray-300">-</span>;
  
  const styles: Record<string, string> = {
    POSITIVE: "bg-emerald-50 text-emerald-700 border-emerald-100 ring-emerald-600/10",
    NEGATIVE: "bg-rose-50 text-rose-700 border-rose-100 ring-rose-600/10",
    NEUTRAL: "bg-gray-50 text-gray-600 border-gray-100 ring-gray-500/10",
  };

  const label = outcome === "POSITIVE" ? "Positive" : outcome === "NEGATIVE" ? "Negative" : "Neutral";
  const finalLabel = mini ? label.slice(0, 3) : label;

  return (
    <span className={cn(
        "inline-flex items-center rounded px-2 py-0.5 text-[10px] font-medium border ring-1 ring-inset",
        styles[outcome] || styles.NEUTRAL
    )}>
      {finalLabel}
    </span>
  );
}