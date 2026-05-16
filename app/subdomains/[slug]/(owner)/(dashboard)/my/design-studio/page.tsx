"use client";

import { useDesign } from "@/context/design-studio-context";
import { useRouter } from "next/navigation";

const formatDate = (dateString: string | Date) => {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(dateString));
};

export default function MainDesignStudio() {
  const router = useRouter();
  const { 
    designs, 
    createDesignProject, 
    isCreatingDesignProject, 
    isDesignsLoading 
  } = useDesign();

  const handleCreateNewDesign = async () => {
    try {
      await createDesignProject();
    } catch (error) {
      console.error("Failed to create design project:", error);
    }
  };

  return (
    // Removed min-h-screen, padding, and background color so it fits flush inside your layout
    <div className="w-full font-sans text-zinc-900">
      
      {/* --- Header Section --- */}
      <div className="mb-8 flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Design Studio</h1>
          <p className="mt-1 text-sm text-zinc-500">Manage and create AI paint mockups for your clients.</p>
        </div>
        
        <button
          onClick={handleCreateNewDesign}
          disabled={isCreatingDesignProject}
          className="group flex items-center gap-2 rounded-xl bg-zinc-900 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition-all hover:bg-zinc-800 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50 active:scale-[0.98]"
        >
          {isCreatingDesignProject ? (
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-400 border-t-white" />
              <span>Creating...</span>
            </div>
          ) : (
            <>
              <svg className="h-4 w-4 transition-transform group-hover:rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              <span>New Design</span>
            </>
          )}
        </button>
      </div>

      {/* --- Main Content Area --- */}
      {isDesignsLoading ? (
        // Loading State: Premium Skeletons
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex flex-col overflow-hidden rounded-2xl border border-black/5 bg-white shadow-sm">
              <div className="aspect-[4/3] w-full animate-pulse bg-zinc-100" />
              <div className="p-5">
                <div className="mb-3 h-5 w-2/3 animate-pulse rounded bg-zinc-100" />
                <div className="h-3 w-1/3 animate-pulse rounded bg-zinc-50" />
              </div>
            </div>
          ))}
        </div>
      ) : designs && designs.length > 0 ? (
        
        // Data State: Grid of Design Cards
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {designs.map((project: any) => (
            <button
              key={project.id}
              onClick={() => router.push(`my/design-studio/${project.id}`)}
              className="group flex flex-col overflow-hidden rounded-2xl border border-black/5 bg-white text-left shadow-sm ring-1 ring-transparent transition-all hover:border-black/10 hover:shadow-md hover:ring-black/5"
            >
              {/* Card Image Area */}
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
                    <svg className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="mt-2 text-[11px] font-semibold uppercase tracking-wider text-zinc-400">Blank Canvas</span>
                  </div>
                )}
                
                {/* Status Badge overlaying the image */}
                <div className="absolute right-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-zinc-700 shadow-sm backdrop-blur-md">
                  {project.mockups?.length > 0 ? `${project.mockups.length} Mockups` : "Draft"}
                </div>
              </div>

              {/* Card Details Area */}
              <div className="flex flex-1 flex-col justify-between p-5">
                <div>
                  <h3 className="truncate text-base font-bold text-zinc-900 transition-colors group-hover:text-zinc-700">
                    {project.name || "Untitled Design"}
                  </h3>
                  <div className="mt-1 flex items-center gap-2 text-xs text-zinc-500">
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {formatDate(project.createdAt)}
                  </div>
                </div>

                {/* Bottom row of card (Client/Booking connection if exists) */}
                {project.booking && (
                  <div className="mt-4 flex items-center gap-2 rounded-lg border border-zinc-100 bg-zinc-50 px-3 py-2 text-xs font-medium text-zinc-600">
                    <svg className="h-3.5 w-3.5 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span className="truncate">{project.booking.name}</span>
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>

      ) : (
        
        // Empty State: Transparent background so it matches your parent card perfectly
        <div className="flex min-h-[400px] flex-col items-center justify-center rounded-3xl border border-dashed border-zinc-200 bg-transparent px-6 py-12 text-center">
          <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-3xl bg-zinc-50 shadow-sm ring-1 ring-black/5">
            <svg className="h-10 w-10 text-zinc-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
               <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h2 className="text-lg font-bold text-zinc-900">No projects yet</h2>
          <p className="mt-2 max-w-sm text-sm text-zinc-500">
            Create your first design project to start uploading photos and generating AI paint mockups.
          </p>
          <button
            onClick={handleCreateNewDesign}
            disabled={isCreatingDesignProject}
            className="mt-6 flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-5 py-2.5 text-sm font-bold text-zinc-900 shadow-sm transition-all hover:border-zinc-300 hover:bg-zinc-50 disabled:opacity-50"
          >
            {isCreatingDesignProject ? "Starting..." : "Create First Design"}
          </button>
        </div>
      )}

    </div>
  );
}