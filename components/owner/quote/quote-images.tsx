interface Mockup {
  id: string;
  name: string;
  compressedS3Key?: string | null;
}

interface QuoteImagesProps {
  originalImageUrl: string | null;
  mockups: Mockup[];
  mockupImageUrls: Record<string, string>;
  loadingImages: boolean;
}

export function QuoteImages({
  originalImageUrl,
  mockups,
  mockupImageUrls,
  loadingImages,
}: QuoteImagesProps) {
  if (!originalImageUrl && mockups.length === 0) return null;

  return (
    <div className="mb-12 print:mb-8 print:break-inside-avoid">
      <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-4 print:text-zinc-500 print:break-after-avoid">
        Project Vision
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Original Space */}
        {originalImageUrl && (
          <div className="flex flex-col gap-2 print:break-inside-avoid">
            <span className="text-xs font-semibold text-zinc-500 uppercase">
              Original Space
            </span>
            <div className="relative aspect-[4/3] bg-zinc-100 rounded-xl overflow-hidden print:border print:border-zinc-300">
              {loadingImages ? (
                <div className="absolute inset-0 flex items-center justify-center animate-pulse text-zinc-400 text-sm">
                  Loading...
                </div>
              ) : (
                <img
                  src={originalImageUrl}
                  alt="Original"
                  className="w-full h-full object-cover"
                />
              )}
            </div>
          </div>
        )}

        {/* Mockups */}
        {mockups.map((mockup) => (
          <div
            key={mockup.id}
            className="flex flex-col gap-2 print:break-inside-avoid"
          >
            <span className="text-xs font-semibold text-zinc-500 uppercase">
              Proposed • {mockup.name}
            </span>
            <div className="relative aspect-[4/3] bg-zinc-100 rounded-xl overflow-hidden print:border print:border-zinc-300">
              {loadingImages ? (
                <div className="absolute inset-0 flex items-center justify-center animate-pulse text-zinc-400 text-sm">
                  Loading...
                </div>
              ) : mockupImageUrls[mockup.id] ? (
                <img
                  src={mockupImageUrls[mockup.id]}
                  alt={`Mockup ${mockup.name}`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-zinc-400 text-sm">
                  Image Unavailable
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}