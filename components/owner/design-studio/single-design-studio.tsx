"use client";
import { useDesign } from "@/context/design-studio-context";
import { useState, useEffect } from "react";
// Change this path to match where you saved the file!
import {
  BRAND_LABELS,
  TRENDING_COLOR_SHADES,
  MAIN_COLOR_SHADES,
  BrandId,
  PaintColor,
} from "@/lib/desing-studio-config";

interface Props {
  designId: string;
}

export default function SingleDesignStudio({ designId }: Props) {
  const [selectedBrand, setSelectedBrand] =
    useState<BrandId>("sherwin_williams");
  const [selectedColor, setSelectedColor] = useState<PaintColor | null>(null);
  const [removeFurniture, setRemoveFurniture] = useState(false);

  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const {
    fetchSingleDesignProject,
    designProject,
    isDesignLoading,
    mutateDesigns,
    uploadImageToDesign,
  } = useDesign();

  useEffect(() => {
    if (designId) {
      fetchSingleDesignProject(designId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [designId]);

  const imageUrl = designProject?.originalImageUrl || null;

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
      // Just call the context function! It handles S3 and the Database.
      await uploadImageToDesign(designId, pendingFile);

      // Clear local states once successful
      setPendingFile(null);
      setPreviewUrl(null);
    } catch (error) {
      console.error("Upload failed:", error);
    } finally {
      setIsUploading(false);
    }
  };
  if (isDesignLoading && !designProject) {
    return (
      <div className="flex h-full min-h-[600px] w-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-zinc-200 border-t-zinc-900" />
      </div>
    );
  }

  return (
    <div className="flex w-full gap-6 bg-transparent p-6 font-sans text-zinc-900">
      {/* --- Left Column: Canvas & Controls --- */}
      <section className="flex flex-1 flex-col gap-4">
        {/* Canvas Area */}
        <div className="relative flex w-full flex-1 max-h-[65vh] min-h-[400px] items-center justify-center overflow-hidden rounded-2xl border border-black/5 bg-white shadow-sm ring-1 ring-zinc-100/50">
          {imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={imageUrl}
              alt="Design project"
              className="h-full w-full object-contain bg-zinc-50"
            />
          ) : previewUrl ? (
            <div className="relative h-full w-full">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previewUrl}
                alt="Preview"
                className="h-full w-full object-contain bg-zinc-50"
              />
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-900/60 backdrop-blur-[2px] transition-all">
                {isUploading ? (
                  <div className="flex flex-col items-center text-center">
                    <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 border border-white/20 backdrop-blur-md shadow-2xl">
                      <div className="h-6 w-6 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                    </div>
                    <h3 className="text-sm font-bold text-white tracking-wide">
                      Uploading to Workspace...
                    </h3>
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <h3 className="mb-6 text-lg font-bold text-white shadow-sm">
                      Looks good?
                    </h3>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={cancelUpload}
                        className="rounded-xl bg-white/10 px-5 py-2.5 text-sm font-semibold text-white backdrop-blur-md transition-all hover:bg-white/20 border border-white/10"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={confirmUpload}
                        className="flex items-center gap-2 rounded-xl bg-white px-6 py-2.5 text-sm font-bold text-zinc-900 shadow-xl transition-all hover:bg-zinc-100 hover:scale-105 active:scale-95"
                      >
                        <svg
                          className="h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2.5}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                          />
                        </svg>
                        Upload Photo
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <label className="group flex h-full w-full cursor-pointer flex-col items-center justify-center transition-colors hover:bg-zinc-50">
              <input
                type="file"
                accept="image/jpeg, image/png, image/webp"
                className="hidden"
                onChange={handleFileSelect}
              />
              <div className="flex flex-col items-center text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-50 border border-zinc-100 shadow-sm transition-transform group-hover:scale-105">
                  <svg
                    className="h-8 w-8 text-zinc-300 transition-colors group-hover:text-zinc-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                    />
                  </svg>
                </div>
                <h3 className="text-sm font-semibold text-zinc-800">
                  Click to Upload Image
                </h3>
                <p className="mt-1 text-sm text-zinc-500">
                  High-res JPEG or PNG up to 10MB.
                </p>
              </div>
            </label>
          )}
        </div>

        {/* Bottom Action Bar */}
        <div className="flex items-center justify-between rounded-2xl border border-black/5 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-900 text-white shadow-sm">
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"
                />
              </svg>
            </div>
            <div>
              <h2 className="text-sm font-bold leading-tight text-zinc-900">
                {designProject?.name || "Design Studio"}
              </h2>
              <p className="text-xs font-medium text-zinc-500">
                ID: {designId}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setRemoveFurniture(!removeFurniture)}
              className="group flex items-center gap-3"
            >
              <div
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 ${removeFurniture ? "bg-zinc-900" : "bg-zinc-200"}`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform duration-300 ${removeFurniture ? "translate-x-6" : "translate-x-1"}`}
                />
              </div>
              <span
                className={`text-sm font-semibold transition-colors ${removeFurniture ? "text-zinc-900" : "text-zinc-500 group-hover:text-zinc-700"}`}
              >
                Remove Furniture
              </span>
            </button>
            <span className="rounded-md bg-amber-50 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-amber-600 ring-1 ring-amber-500/20">
              Beta
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button className="inline-flex h-10 items-center gap-2 rounded-xl px-3 text-sm font-semibold text-zinc-600 transition-colors hover:bg-zinc-50 hover:text-zinc-900">
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8m-4-6l-4-4m0 0L8 6m4-4v12"
                />
              </svg>{" "}
              Share
            </button>
            <button className="inline-flex h-10 items-center gap-2 rounded-xl px-3 text-sm font-semibold text-zinc-600 transition-colors hover:bg-zinc-50 hover:text-zinc-900">
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                />
              </svg>{" "}
              Connect
            </button>
            <div className="mx-1 h-5 w-px bg-zinc-200" />
            <button
              disabled={!selectedColor || !imageUrl}
              className={`group ml-1 flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold transition-all duration-200 ${selectedColor && imageUrl ? "bg-zinc-900 text-white shadow-md shadow-zinc-900/10 hover:bg-zinc-800 hover:shadow-lg hover:shadow-zinc-900/20 active:scale-[0.98]" : "cursor-not-allowed bg-zinc-100 text-zinc-400"}`}
            >
              <svg
                className={`h-4 w-4 ${selectedColor && imageUrl ? "text-amber-400" : "text-zinc-300"}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z"
                />
              </svg>{" "}
              Generate
            </button>
          </div>
        </div>
      </section>

      {/* --- Right Column: Color Properties --- */}
      <section className="relative flex w-[380px] shrink-0 flex-col overflow-hidden rounded-2xl border border-black/5 bg-white shadow-sm">
        <div className="flex-1 overflow-y-auto p-6 pb-32 scrollbar-hide">
          <div className="mb-8">
            <h3 className="mb-3 text-[11px] font-bold uppercase tracking-wider text-zinc-400">
              Paint Brand
            </h3>
            <div className="flex flex-wrap gap-2">
              {(Object.keys(BRAND_LABELS) as BrandId[]).map((brand) => (
                <button
                  key={brand}
                  onClick={() => {
                    setSelectedBrand(brand);
                    setSelectedColor(null);
                  }}
                  className={`rounded-full px-4 py-2 text-xs font-bold transition-all ${selectedBrand === brand ? "bg-zinc-900 text-white shadow-md shadow-zinc-900/10" : "bg-zinc-50 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900"}`}
                >
                  {BRAND_LABELS[brand]}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-8">
            <h3 className="mb-3 flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-zinc-400">
              Trending 2024{" "}
              <svg
                className="h-4 w-4 text-amber-400"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
              </svg>
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {TRENDING_COLOR_SHADES[selectedBrand].map((color) => (
                <button
                  key={color.code}
                  onClick={() => setSelectedColor(color)}
                  className={`group relative overflow-hidden rounded-xl border text-left transition-all ${selectedColor?.hex === color.hex ? "border-zinc-900 ring-1 ring-zinc-900 shadow-md" : "border-zinc-100 hover:border-zinc-300"}`}
                >
                  <div
                    className="h-16 w-full"
                    style={{ backgroundColor: color.hex }}
                  />
                  <div className="bg-white p-3">
                    <p className="truncate text-sm font-bold text-zinc-900">
                      {color.name}
                    </p>
                    <p className="text-[11px] font-medium text-zinc-400">
                      {color.code}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <h3 className="mb-3 text-[11px] font-bold uppercase tracking-wider text-zinc-400">
              Full Palette
            </h3>
            <div className="grid grid-cols-4 gap-2">
              {MAIN_COLOR_SHADES[selectedBrand].map((color) => (
                <button
                  key={color.code}
                  onClick={() => setSelectedColor(color)}
                  title={`${color.name} (${color.code})`}
                  className={`group relative aspect-square w-full overflow-hidden rounded-lg transition-all ${selectedColor?.hex === color.hex ? "z-10 scale-105 ring-2 ring-zinc-900 ring-offset-2" : "ring-1 ring-black/5 hover:scale-105 hover:ring-black/20"}`}
                >
                  <div
                    className="absolute inset-0"
                    style={{ backgroundColor: color.hex }}
                  />
                  <div className="absolute inset-0 shadow-[inset_0_0_0_1px_rgba(0,0,0,0.05)]" />
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between border-t border-black/5 bg-white/95 p-4 backdrop-blur-xl">
          <div>
            <p className="text-sm font-bold text-zinc-900">
              {selectedColor ? selectedColor.name : "Select a Color"}
            </p>
            <p className="mt-0.5 text-[11px] font-medium uppercase tracking-wider text-zinc-500">
              {selectedColor
                ? `${BRAND_LABELS[selectedBrand]} • ${selectedColor.code}`
                : "Awaiting selection..."}
            </p>
          </div>
          {selectedColor ? (
            <div
              className="h-10 w-10 rounded-full shadow-[inset_0_0_0_1px_rgba(0,0,0,0.1),_0_2px_8px_rgba(0,0,0,0.1)]"
              style={{ backgroundColor: selectedColor.hex }}
            />
          ) : (
            <div className="h-10 w-10 rounded-full border border-dashed border-zinc-300 bg-zinc-50" />
          )}
        </div>
      </section>
    </div>
  );
}
