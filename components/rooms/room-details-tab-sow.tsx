"use client";

import { useMemo, useState } from "react";
import useSWR from "swr"; // npm install swr
import { toast } from "sonner"; // npm install sonner (or your preferred toast lib)
import {
  Clipboard,
  MapPin,
  Paintbrush,
  Hammer,
  AlertTriangle,
  StickyNote,
  DatabaseZap,
  Camera,
  MoreHorizontal,
  Pencil,
  Trash2,
  CirclePlus,
} from "lucide-react";

import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

// Dialog Imports (Assumed to exist based on your prompt)
import { SowAddItemDialog } from "./dialogs/sow-add-item-dialog";
import { SowEditItemDialog } from "./dialogs/sow-edit-item-dialog";
import { SowDeleteItemDialog } from "./dialogs/sow-delete-item-dialog";
import { useOwner } from "@/context/owner-context";
import { ScopeItem, ScopeType } from "@/types/room-types";

// --- TYPES ---

// export interface ScopeItem {
//   type: string;
//   area: string;
//   item: string;
//   action: string;
//   timestamp?: string; // Used as unique ID
//   image_url?: string | null;
//   images?: string[];
// }

interface RoomDetailsTabSowProps {
  initialItems: ScopeItem[];
  activeArea: string;
  onUpdateItems?: (items: ScopeItem[]) => void;
  roomId: string;
}

// --- SWR FETCHER ---
const fetcher = (url: string) => fetch(url).then((res) => res.json());

// --- CONFIG ---
const CATEGORY_ORDER = ["REPAIR", "PREP", "PAINT", "NOTE"];

const getCategoryConfig = (type: string) => {
  switch (type) {
    case "REPAIR":
      return { label: "Repairs", icon: AlertTriangle, color: "text-rose-600" };
    case "PREP":
      return { label: "Prep Work", icon: Hammer, color: "text-amber-600" };
    case "PAINT":
      return { label: "Paint", icon: Paintbrush, color: "text-blue-600" };
    case "NOTE":
      return { label: "Notes", icon: StickyNote, color: "text-zinc-500" };
    default:
      return { label: "General", icon: DatabaseZap, color: "text-zinc-600" };
  }
};

export function RoomDetailsTabSow({
  initialItems,
  activeArea,
  onUpdateItems,
  roomId,
}: RoomDetailsTabSowProps) {
  const { subdomain } = useOwner();

  // --- API / SWR STATE ---
  const apiEndpoint = `/api/subdomain/${subdomain.slug}/room/${roomId}/scopes`;

  const { data: roomData, mutate } = useSWR(apiEndpoint, fetcher, {
    fallbackData: { scopeData: initialItems }, // Shows initial props immediately
    revalidateOnFocus: false,
  });

  // Safe cast: Prisma JSON -> ScopeItem[]
  const items = (roomData?.scopeData || []) as ScopeItem[];

  // --- DIALOG STATES ---
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ScopeItem | null>(null);

  // --- PRE-FILL STATES ---
  const [preFillArea, setPreFillArea] = useState<string>("");
  const [preFillCategory, setPreFillCategory] = useState<string | undefined>(
    undefined
  );
  const [isAreaLocked, setIsAreaLocked] = useState(false);

  // --- CORE UPDATE LOGIC (Optimistic UI) ---
  const executeUpdate = async (newItems: ScopeItem[]) => {
    // 1. Optimistic Update (Immediate UI change)
    await mutate({ ...roomData, scopeData: newItems }, { revalidate: false });

    // Notify parent if needed
    onUpdateItems?.(newItems);

    try {
      // 2. Network Request
      const response = await fetch(apiEndpoint, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scopeData: newItems }),
      });

      if (!response.ok) throw new Error("Failed to save changes");

      // 3. Sync with Server (Update cache with actual server response)
      const updatedServerData = await response.json();
      mutate(updatedServerData, { revalidate: false });

      toast.success("Saved");
    } catch (error) {
      console.error("Error saving scope items:", error);
      toast.error("Failed to save changes");
      // 4. Rollback on error
      mutate();
    }
  };

  // --- ACTION HANDLERS ---

  const handleAddItem = (newItem: ScopeItem) => {
    // Ensure we have a unique ID/Timestamp
    const itemWithId = {
      ...newItem,
      timestamp: newItem.timestamp || new Date().toISOString(),
    };
    const updatedList = [...items, itemWithId];

    executeUpdate(updatedList);
    setIsAddOpen(false);
  };

  const handleEditItem = (updatedItem: ScopeItem) => {
    const updatedList = items.map((i) =>
      i.timestamp === updatedItem.timestamp ? updatedItem : i
    );
    executeUpdate(updatedList);
    setIsEditOpen(false);
  };

  const handleDeleteItem = () => {
    if (!selectedItem) return;
    const updatedList = items.filter(
      (i) => i.timestamp !== selectedItem.timestamp
    );
    executeUpdate(updatedList);
    setIsDeleteOpen(false);
  };

  const openAddDialog = (area?: string, category?: string) => {
    if (area) {
      // Nested click: Lock the area
      setPreFillArea(area);
      setIsAreaLocked(true);
    } else {
      // Global click: Default to active filter, but unlock
      setPreFillArea(activeArea === "ALL" ? "" : activeArea);
      setIsAreaLocked(false);
    }
    setPreFillCategory(category);
    setIsAddOpen(true);
  };

  // --- GROUPING LOGIC ---
  const groupedByArea = useMemo(() => {
    const filtered =
      activeArea === "ALL" ? items : items.filter((i) => i.area === activeArea);
    const groups: Record<string, ScopeItem[]> = {};
    filtered.forEach((item) => {
      if (!groups[item.area]) groups[item.area] = [];
      groups[item.area].push(item);
    });
    return groups;
  }, [items, activeArea]);

  return (
    <>
      <ScrollArea className="h-full bg-zinc-50/50">
        <div className="p-4 space-y-6">
          {/* GLOBAL ADD BUTTON */}
          <div className="flex justify-end">
            <Button
              size="sm"
              variant="outline"
              onClick={() => openAddDialog()}
              className="gap-2"
            >
              <CirclePlus className="w-4 h-4" /> Add Item
            </Button>
          </div>

          {/* EMPTY STATE */}
          {items.length === 0 && (
            <div className="flex flex-col items-center justify-center py-10 opacity-50">
              <Clipboard className="w-10 h-10 text-zinc-300 mb-3" />
              <p className="text-sm text-zinc-500 font-medium">
                No scope items recorded.
              </p>
              <Button
                variant="link"
                onClick={() => openAddDialog()}
                className="mt-2"
              >
                Add your first item
              </Button>
            </div>
          )}

          {/* AREA GROUPS */}
          {Object.entries(groupedByArea).map(([areaName, areaItems]) => {
            // Get all images from IMAGE type items
            const allImages = areaItems
              .filter((i) => i.type === ScopeType.IMAGE)
              .flatMap((i) => i.image_urls || []);

            const coverImage = allImages[0];
            const extraPhotoCount = Math.max(0, allImages.length - 1);

            // Group items inside this area by Category (exclude IMAGE type)
            const itemsByCategory: Record<string, ScopeItem[]> = {};
            areaItems.forEach((i) => {
              if (i.type === ScopeType.IMAGE) return; // Skip IMAGE items
              if (!itemsByCategory[i.type]) itemsByCategory[i.type] = [];
              itemsByCategory[i.type].push(i);
            });

            return (
              <div
                key={areaName}
                className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden"
              >
                {/* --- CARD HEADER --- */}
                <div className="relative border-b border-zinc-100">
                  {coverImage && (
                    <div className="absolute inset-0 z-0 group cursor-pointer">
                      <img
                        src={coverImage}
                        alt={areaName}
                        className="w-full h-full object-cover opacity-90 transition-transform duration-700 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                    </div>
                  )}

                  <div
                    className={cn(
                      "relative z-10 p-4 flex items-end justify-between",
                      coverImage
                        ? "pt-20 text-white"
                        : "bg-zinc-50/80 text-zinc-900"
                    )}
                  >
                    <div>
                      {allImages.length > 1 && (
                        <div
                          className={cn(
                            "flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider backdrop-blur-md mb-1 w-fit",
                            coverImage
                              ? "bg-black/40 text-white border border-white/20"
                              : "bg-zinc-100 text-zinc-500 border border-zinc-200"
                          )}
                        >
                          <Camera className="w-3 h-3" />+{extraPhotoCount}
                        </div>
                      )}
                      <h3 className="text-lg font-bold capitalize tracking-tight drop-shadow-sm leading-none flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        {areaName}
                      </h3>
                    </div>
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-[10px] border h-6",
                        coverImage
                          ? "bg-white/10 border-white/30 text-white backdrop-blur-md"
                          : "bg-white text-zinc-500 border-zinc-200"
                      )}
                    >
                      {areaItems.length} Tasks
                    </Badge>
                  </div>
                </div>

                {/* --- IMAGE GALLERY --- */}
                {allImages.length > 0 && (
                  <div className="p-4 border-b border-zinc-100 bg-zinc-50/30">
                    <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
                      {allImages.map((img, idx) => (
                        <div
                          key={idx}
                          className="aspect-square rounded-lg overflow-hidden border border-zinc-200 bg-zinc-100 hover:ring-2 hover:ring-blue-500 transition-all cursor-pointer group"
                        >
                          <img
                            src={img as string}
                            alt={`photo ${idx}`}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* --- CATEGORY TABLES --- */}
                {CATEGORY_ORDER.map((cat) => {
                  const catItems = itemsByCategory[cat];
                  if (!catItems || catItems.length === 0) return null;

                  const config = getCategoryConfig(cat);
                  const Icon = config.icon;

                  return (
                    <div
                      key={cat}
                      className="border-b border-zinc-100 last:border-b-0"
                    >
                      <div className="px-3 py-2 flex items-center justify-between gap-2 group/header">
                        <span
                          className={cn(
                            "text-[10px] font-bold uppercase tracking-wider",
                            config.color
                          )}
                        >
                          {config.label}
                        </span>
                        <div className="flex items-center gap-2">
                          <CirclePlus
                            onClick={() => openAddDialog(areaName, cat)}
                            className={cn(
                              "w-3.5 h-3.5 cursor-pointer hover:opacity-70 mr-1 transition-opacity opacity-0 group-hover/header:opacity-100",
                              config.color
                            )}
                          />
                        </div>
                      </div>

                      <table className="w-full">
                        <tbody>
                          {catItems.map((item, idx) => (
                            <tr
                              key={idx}
                              className="border-b border-zinc-50 last:border-b-0 hover:bg-zinc-50/30 group/row"
                            >
                              <td className="px-3 py-2 w-[30px]">
                                <Icon
                                  className={cn("w-3.5 h-3.5", config.color)}
                                />
                              </td>
                              <td className="px-3 py-2 text-xs capitalize text-zinc-900">
                                {item.item}
                              </td>
                              <td className="px-3 py-2 text-[10px] uppercase tracking-wide font-mono text-zinc-500">
                                {item.action}
                              </td>
                              <td className="px-3 py-2 text-right w-[60px]">
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-6 w-6 p-0 opacity-0 group-hover/row:opacity-100 transition-opacity"
                                    >
                                      <MoreHorizontal className="size-3" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent
                                    align="end"
                                    className="w-32"
                                  >
                                    <DropdownMenuItem
                                      onClick={() => {
                                        setSelectedItem(item);
                                        setIsEditOpen(true);
                                      }}
                                      className="text-xs cursor-pointer"
                                    >
                                      <Pencil className="mr-2 size-3 hover:text-white" />{" "}
                                      Edit
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                      onClick={() => {
                                        setSelectedItem(item);
                                        setIsDeleteOpen(true);
                                      }}
                                      className="text-xs text-red-600 cursor-pointer"
                                      variant="destructive"
                                    >
                                      <Trash2 className="mr-2 size-3" /> Delete
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </ScrollArea>

      {/* --- DIALOGS --- */}

      <SowAddItemDialog
        isOpen={isAddOpen}
        onOpenChange={setIsAddOpen}
        initialArea={preFillArea}
        initialCategory={preFillCategory}
        isAreaLocked={isAreaLocked}
        onSave={handleAddItem}
      />

      <SowEditItemDialog
        isOpen={isEditOpen}
        onOpenChange={setIsEditOpen}
        itemToEdit={selectedItem}
        onSave={handleEditItem}
      />

      <SowDeleteItemDialog
        isOpen={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        itemToDelete={selectedItem}
        onConfirm={handleDeleteItem}
      />
    </>
  );
}
