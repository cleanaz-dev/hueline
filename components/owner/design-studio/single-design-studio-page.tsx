"use client";

import { useState } from "react";
import useSWR from "swr";
import { motion, AnimatePresence } from "framer-motion";
import { useDesign } from "@/context/design-studio-context";
import { useOwner } from "@/context/owner-context";
import { BrandId, PaintColor } from "@/lib/desing-studio-config";
import { DesignProject, Customer, SubBookingData, Mockup } from "@/app/generated/prisma";
import { DesignControlsBar } from "./design-controls-bar";
import { DesignStudioPalette } from "./design-studio-palette";
import { DesignImageViewer } from "./design-image-viewer";

type ProjectWithCustomer = DesignProject & {
  customer?: Customer | null;
  booking?: SubBookingData | null;
  mockups?: Mockup[] | null;
};

interface Props {
  designId: string;
  initialDesignProject: ProjectWithCustomer;
  initialImageUrl: string | null;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function SingleDesignStudio({
  designId,
  initialDesignProject,
  initialImageUrl,
}: Props) {
  const { subdomain } = useOwner();
  const { 
    uploadImageToDesign, 
    generateDesignProjectImage, 
    isGeneratingProjectImage 
  } = useDesign();

  // 1. Fetching & Database State
  const { data: designProject, isLoading: isDesignLoading, mutate: mutateProject } = useSWR<ProjectWithCustomer>(
    `/api/subdomain/${subdomain.slug}/designs/${designId}`,
    fetcher,
    { fallbackData: initialDesignProject }
  );

  // 2. Canvas & Image State
  const [imageUrl, setImageUrl] = useState<string | null>(initialImageUrl);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // 3. Crossfade Mockup State
  const [selectedMockup, setSelectedMockup] = useState<Mockup | null>(null);

  // ✅ Clean: Relying on the server to populate presignedUrl
  const activeImageUrl = selectedMockup ? selectedMockup.presignedUrl : imageUrl;

  // 4. Palette & Controls State
  const [selectedBrand, setSelectedBrand] = useState<BrandId>("sherwin_williams");
  const [selectedColor, setSelectedColor] = useState<PaintColor | null>(null);
  
  const [removeFurniture, setRemoveFurniture] = useState(false);
  const [deliveryMethod, setDeliveryMethod] = useState<"sms" | "email">("sms");
  const [roomType, setRoomType] = useState<string>("room");

  // --- Handlers ---
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPendingFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const cancelUpload = () => {
    setPendingFile(null);
    setPreviewUrl(null);
  };

  const confirmUpload = async () => {
    if (!pendingFile) return;
    setIsUploading(true);
    try {
      const newS3Key = await uploadImageToDesign(designId, pendingFile);
      mutateProject((prev) => prev ? { ...prev, originalImageS3Key: newS3Key } : prev, false);
      setImageUrl(URL.createObjectURL(pendingFile));
      setPendingFile(null);
      setPreviewUrl(null);
    } catch (error) {
      console.error("Upload failed:", error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleGenerate = async () => {
    if (!selectedColor) return;
    try {
      await generateDesignProjectImage({
        designId,
        deliveryMethod,
        selectedColor,
        removeFurniture,
        customerId: designProject?.customer?.id,
        roomType,
      });
      // Clear mockup view so user sees loading state on original image
      setSelectedMockup(null);
      mutateProject();
    } catch (error) {
      console.error("Generation failed:", error);
    }
  };

  if (isDesignLoading) {
    return (
      <div className="flex h-full min-h-[600px] w-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-zinc-200 border-t-zinc-900" />
      </div>
    );
  }

  const mockups = designProject?.mockups || [];

  return (
    <div className="flex w-full gap-6 bg-transparent p-6 font-sans text-zinc-900">
      
      {/* --- Left Column: Canvas & Controls --- */}
      <section className="flex flex-1 flex-col gap-4">
        
        {/* Canvas Area - FLUID RESPONSIVE HEIGHT RESTORED */}
       <div className="relative flex w-full flex-1 max-h-[70vh] min-h-[650px] items-center justify-center overflow-hidden rounded-2xl border border-black/5 bg-zinc-50 shadow-sm ring-1 ring-zinc-100/50">
          
          <div className="absolute left-4 top-4 z-10 flex items-center gap-2 rounded-lg bg-slate-900/50 px-3 py-1.5 backdrop-blur-md shadow-sm border border-white/10">
            <span className="flex h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]"></span>
            <span className="text-xs font-semibold tracking-wider text-white/95">
              ID: {designId}
            </span>
          </div>

          {/* Generating Overlay */}
          {isGeneratingProjectImage && (
            <div className="absolute inset-0 z-20 flex items-center justify-center bg-zinc-900/70 backdrop-blur-sm">
              <div className="flex flex-col items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 border border-white/20 backdrop-blur-md shadow-2xl">
                  <div className="h-7 w-7 rounded-full border-2 border-white/30 border-t-amber-400 animate-spin" />
                </div>
                <div className="text-center">
                  <h3 className="text-sm font-bold text-white tracking-wide">Generating Design...</h3>
                  <p className="mt-1 text-xs text-white/60">This may take a moment</p>
                </div>
              </div>
            </div>
          )}

          {/* Absolute images overlap during transition, preventing any height jumps */}
          <AnimatePresence>
            {activeImageUrl && !previewUrl ? (
              <motion.img 
                key={activeImageUrl}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4, ease: "easeInOut" }}
                src={activeImageUrl} 
                alt="Workspace Project" 
                className="absolute inset-0 h-full w-full object-contain" 
              />
            ) : previewUrl ? (
              <div className="relative h-full w-full z-10">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={previewUrl} alt="Preview" className="h-full w-full object-contain" />
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-900/60 backdrop-blur-[2px] transition-all">
                  {isUploading ? (
                    <div className="flex flex-col items-center text-center">
                      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 border border-white/20 backdrop-blur-md shadow-2xl">
                        <div className="h-6 w-6 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                      </div>
                      <h3 className="text-sm font-bold text-white tracking-wide">Uploading...</h3>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center">
                      <h3 className="mb-6 text-lg font-bold text-white shadow-sm">Looks good?</h3>
                      <div className="flex items-center gap-3">
                        <button onClick={cancelUpload} className="rounded-xl bg-white/10 px-5 py-2.5 text-sm font-semibold text-white backdrop-blur-md transition-all hover:bg-white/20 border border-white/10">
                          Cancel
                        </button>
                        <button onClick={confirmUpload} className="flex items-center gap-2 rounded-xl bg-white px-6 py-2.5 text-sm font-bold text-zinc-900 shadow-xl transition-all hover:bg-zinc-100 hover:scale-105 active:scale-95">
                          Upload Photo
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <label className="group relative z-10 flex h-full w-full cursor-pointer flex-col items-center justify-center transition-colors hover:bg-black/5">
                <input type="file" accept="image/jpeg, image/png, image/webp" className="hidden" onChange={handleFileSelect} />
                <div className="flex flex-col items-center text-center">
                  <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white border border-zinc-200 shadow-sm transition-transform group-hover:scale-105">
                    <svg className="h-8 w-8 text-zinc-300 transition-colors group-hover:text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                  </div>
                  <h3 className="text-sm font-semibold text-zinc-800">Click to Upload Image</h3>
                  <p className="mt-1 text-sm text-zinc-500">High-res JPEG or PNG up to 10MB.</p>
                </div>
              </label>
            )}
          </AnimatePresence>

          {/* Extracted Thumbnail Viewer */}
          {!previewUrl && imageUrl && (
            <DesignImageViewer 
              mockups={mockups} 
              originalImageUrl={imageUrl}
              selectedMockup={selectedMockup}
              setSelectedMockup={setSelectedMockup}
            />
          )}
        </div>

        {/* --- Bottom Controls Component --- */}
        <DesignControlsBar 
          customer={designProject?.customer}
          deliveryMethod={deliveryMethod}
          setDeliveryMethod={setDeliveryMethod}
          removeFurniture={removeFurniture}
          setRemoveFurniture={setRemoveFurniture}
          canGenerate={!!(selectedColor && imageUrl) && !isGeneratingProjectImage}
          onGenerate={handleGenerate}
          roomType={roomType}
          setRoomType={setRoomType}
        />
      </section>

      {/* --- Right Column: Color Palette & Mockup Details --- */}
      <DesignStudioPalette 
        selectedBrand={selectedBrand}
        setSelectedBrand={setSelectedBrand}
        selectedColor={selectedColor}
        setSelectedColor={setSelectedColor}
        selectedMockup={selectedMockup}
        setSelectedMockup={setSelectedMockup}
        huelineId={designProject?.booking?.huelineId}
      />
    </div>
  );
}