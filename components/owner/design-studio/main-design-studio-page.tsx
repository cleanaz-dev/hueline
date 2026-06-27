"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useDesign } from "@/context/design-studio-context";
import { useOwner } from "@/context/owner-context";
import { Loader2, Plus, ImageIcon, CalendarDays, Palette } from "lucide-react";

// shadcn/ui components
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import OwnerPageHeader from "../owner-page.header";

const formatDate = (dateString: string | Date) => {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(dateString));
};

export default function MainDesignStudio() {
  const router = useRouter();
  const { customers, isCustomersLoading } = useOwner();
  const {
    designs,
    createDesignProject,
    isCreatingDesignProject,
    isDesignsLoading,
  } = useDesign();

  // --- Modal & Form State ---
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [customerMode, setCustomerMode] = useState<"existing" | "new">("new");
  const [roomType, setRoomType] = useState<string | null>(null);

  // Existing Customer State
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>("");

  // New Customer State
  const [newCustomer, setNewCustomer] = useState({
    name: "",
    email: "",
    phone: "",
  });

  const handleCreateNewDesign = async () => {
    try {
      // 🟢 NOTE: You will need to update your context to accept this payload!
      // Example: await createDesignProject({ customerMode, selectedCustomerId, newCustomer })

      await createDesignProject({
        customerMode,
        customerId: selectedCustomerId,
        newCustomer,
      }); // <-- Update this call based on your API

      setIsDialogOpen(false);
    } catch (error) {
      console.error("Failed to create design project:", error);
    }
  };

  // Validation to disable the create button if fields are missing
  const canCreate =
    customerMode === "existing" ? !!selectedCustomerId : !!newCustomer.name;

  return (
    <div className="w-full font-sans text-zinc-900">
      {/* --- Header Section --- */}

      <OwnerPageHeader
        title="Design Studio"
        description="Manage and create AI paint mockups for your clients."
        icon={<Palette className="size-6" />}
        onAddClick={() => setIsDialogOpen(true)}
        addButtonLabel="New Design"
      />

      {/* --- Main Content Area --- */}
      {isDesignsLoading ? (
        // Loading State
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="flex flex-col overflow-hidden rounded-2xl border border-black/5 bg-white shadow-sm"
            >
              <div className="aspect-[4/3] w-full animate-pulse bg-zinc-100" />
              <div className="p-5">
                <div className="mb-3 h-5 w-2/3 animate-pulse rounded bg-zinc-100" />
                <div className="h-3 w-1/3 animate-pulse rounded bg-zinc-50" />
              </div>
            </div>
          ))}
        </div>
      ) : designs && designs.length > 0 ? (
        // Grid of Design Cards
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {designs.map((project: any) => (
            <button
              key={project.id}
              onClick={() => router.push(`/my/design-studio/${project.id}`)}
              className="group flex flex-col overflow-hidden rounded-2xl border border-black/5 bg-white text-left shadow-sm ring-1 ring-transparent transition-all hover:border-black/10 hover:shadow-md hover:ring-black/5"
            >
              <div className="relative aspect-[4/3] w-full overflow-hidden bg-zinc-50">
                {project.originalImageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={project.originalImageUrl}
                    alt={project.name || "Design Project"}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full w-full flex-col items-center justify-center bg-zinc-50/50 text-zinc-300 transition-colors group-hover:bg-zinc-100/50">
                    <ImageIcon className="h-10 w-10 mb-2 opacity-50" />
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                      Blank Canvas
                    </span>
                  </div>
                )}

                <div className="absolute right-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-zinc-700 shadow-sm backdrop-blur-md">
                  {project.mockups?.length > 0
                    ? `${project.mockups.length} Mockups`
                    : "Draft"}
                </div>
              </div>

              <div className="flex flex-1 flex-col justify-between p-5">
                <div>
                  <h3 className="truncate text-base font-bold text-zinc-900 transition-colors group-hover:text-zinc-700">
                    {project.name || "Untitled Design"}
                  </h3>
                  <div className="mt-1 flex items-center gap-2 text-xs text-zinc-500">
                    <CalendarDays className="h-3.5 w-3.5" />
                    {formatDate(project.createdAt)}
                  </div>
                </div>

                {project.customer && (
                  <div className="mt-4 flex items-center gap-2 rounded-lg border border-zinc-100 bg-zinc-50 px-3 py-2 text-xs font-medium text-zinc-600">
                    <div className="h-4 w-4 flex items-center justify-center rounded-full bg-zinc-200 text-[9px] font-bold text-zinc-600">
                      {project.customer.name?.charAt(0).toUpperCase()}
                    </div>
                    <span className="truncate">{project.customer.name}</span>
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>
      ) : (
        // Empty State
        <div className="flex min-h-[400px] flex-col items-center justify-center rounded-3xl border border-dashed border-zinc-200 bg-transparent px-6 py-12 text-center">
          <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-3xl bg-zinc-50 shadow-sm ring-1 ring-black/5">
            <ImageIcon className="h-10 w-10 text-zinc-300" />
          </div>
          <h2 className="text-lg font-bold text-zinc-900">No projects yet</h2>
          <p className="mt-2 max-w-sm text-sm text-zinc-500">
            Create your first design project to start uploading photos and
            generating AI paint mockups.
          </p>
          <Button
            onClick={() => setIsDialogOpen(true)}
            className="mt-6 rounded-xl border border-zinc-200 bg-white px-5 py-2.5 text-sm font-bold text-zinc-900 shadow-sm hover:bg-zinc-50"
          >
            Create First Design
          </Button>
        </div>
      )}

      {/* --- Create Design Dialog --- */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create Design Project</DialogTitle>
            <DialogDescription>
              Attach a customer to start generating AI mockups.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <Tabs
              defaultValue="new"
              className="w-full"
              onValueChange={(val) =>
                setCustomerMode(val as "new" | "existing")
              }
            >
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="new">New Customer</TabsTrigger>
                <TabsTrigger value="existing">Existing Customer</TabsTrigger>
              </TabsList>

              {/* NEW CUSTOMER TAB */}
              <TabsContent value="new" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">
                    Full Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="name"
                    placeholder="John Doe"
                    value={newCustomer.name}
                    onChange={(e) =>
                      setNewCustomer((prev) => ({
                        ...prev,
                        name: e.target.value,
                      }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="(555) 000-0000"
                    value={newCustomer.phone}
                    onChange={(e) =>
                      setNewCustomer((prev) => ({
                        ...prev,
                        phone: e.target.value,
                      }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="john@example.com"
                    value={newCustomer.email}
                    onChange={(e) =>
                      setNewCustomer((prev) => ({
                        ...prev,
                        email: e.target.value,
                      }))
                    }
                  />
                </div>
              </TabsContent>

              {/* EXISTING CUSTOMER TAB */}
              <TabsContent value="existing" className="space-y-4">
                <div className="space-y-2">
                  <Label>
                    Select Client <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={selectedCustomerId}
                    onValueChange={setSelectedCustomerId}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue
                        placeholder={
                          isCustomersLoading
                            ? "Loading..."
                            : "Search clients..."
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {customers?.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.name || "Unknown"} {c.phone ? `· ${c.phone}` : ""}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
              disabled={isCreatingDesignProject}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateNewDesign}
              disabled={!canCreate || isCreatingDesignProject}
              className="bg-zinc-900 text-white hover:bg-zinc-800"
            >
              {isCreatingDesignProject ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating...
                </>
              ) : (
                "Create Project"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
