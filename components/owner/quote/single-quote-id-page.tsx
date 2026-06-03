"use client";
import { CheckCircle, Save, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import axios from "axios";

import { PrintButton } from "@/components/owner/quote/print-button";
import { QuoteList, QuoteItem } from "@/components/owner/quote/quote-list";
import { QuoteImages } from "@/components/owner/quote/quote-images";
import { QuoteDetails } from "@/components/owner/quote/quote-details";
import { QuoteData } from "@/lib/prisma/queries/quote/get-quote";
import { useQuote } from "@/context/quote-context";

interface Props {
  quote: QuoteData;
  isOwner?: boolean;
}

export default function SingleQuoteIdPage({ quote: serverQuote, isOwner }: Props) {
  const { generatingQuote, handleQuoteGeneration, quote: contextQuote } = useQuote();

  // SIMPLIFIED FALLBACK LOGIC: 
  // If SWR has loaded the quote, use it. Otherwise use the initial server data!
  // This automatically pushes updates to your list when mutate() runs.
  const quote = (contextQuote as QuoteData) ?? serverQuote;

  const items = (quote?.items as QuoteItem[]) ?? [];
  const customer = quote?.customer;
  const companyName = quote?.booking?.subdomain?.companyName || "HUE-LINE";
  const paintColors = quote?.booking?.paintColors || [];
  const mockups = quote?.booking?.mockups || [];

  const [loadingImages, setIsLoadingImages] = useState<boolean>(false);
  const [originalImageUrl, setOriginalImageUrl] = useState<string | null>(null);
  const [mockupImageUrls, setMockupImageUrls] = useState<Record<string, string>>({});

  useEffect(() => {
    let isMounted = true;

    const fetchImages = async () => {
      setIsLoadingImages(true);
      try {
        const promises = [];
        const originalImageKey = quote?.booking?.compressOriginalImages;
        
        if (originalImageKey) {
          promises.push(
            axios
              .get(`/api/files/presign?key=${encodeURIComponent(originalImageKey)}`)
              .then((res) => {
                if (isMounted) setOriginalImageUrl(res.data);
              })
          );
        }

        for (const mockup of mockups) {
          if (mockup.compressedS3Key) {
            promises.push(
              axios
                .get(`/api/files/presign?key=${encodeURIComponent(mockup.compressedS3Key)}`)
                .then((res) => {
                  if (isMounted) {
                    setMockupImageUrls((prev) => ({
                      ...prev,
                      [mockup.id]: res.data,
                    }));
                  }
                })
            );
          }
        }

        await Promise.allSettled(promises);
      } catch (error) {
        console.error("Error fetching images:", error);
      } finally {
        if (isMounted) setIsLoadingImages(false);
      }
    };

    fetchImages();

    return () => {
      isMounted = false;
    };
  }, [quote, mockups]);

  return (
    <div className="min-h-screen bg-zinc-50 py-12 px-4 font-sans text-zinc-900 print:bg-white print:py-0 print:px-0">
      <div className="max-w-4xl mx-auto mb-6 flex justify-between items-center print:hidden">
        <div className="text-sm font-medium text-zinc-500">
          Prepared for {customer?.name}
        </div>
        <PrintButton />
      </div>

      <div className="max-w-4xl mx-auto bg-white border border-zinc-200 shadow-xl rounded-2xl overflow-hidden print:shadow-none print:border-none print:m-0 print:rounded-none">
        
        <QuoteDetails 
          quote={quote} 
          companyName={companyName} 
          customer={customer} 
          paintColors={paintColors} 
        />

        <div className="px-10 pb-10 print:px-8 print:pb-8">
          <QuoteImages
            originalImageUrl={originalImageUrl}
            mockups={mockups}
            mockupImageUrls={mockupImageUrls}
            loadingImages={loadingImages}
          />

          <QuoteList
            items={items}
            totalAmount={quote?.totalAmount || 0}
            isOwner={isOwner}
          />
        </div>

        <div className="bg-zinc-50 p-6 border-t border-zinc-200 flex justify-end print:hidden">
          {isOwner ? (
            <button
              disabled={generatingQuote || !quote?.id}
              className="bg-[#007AFF] text-white px-8 py-3 rounded-xl font-bold shadow-md hover:bg-blue-600 transition-all flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
              onClick={() => quote?.id && handleQuoteGeneration(quote.id)}
            >
              {generatingQuote ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Generate Quote
                </>
              )}
            </button>
          ) : (
            <button className="bg-[#007AFF] text-white px-8 py-3 rounded-xl font-bold shadow-md hover:bg-blue-600 transition-all flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              Accept Estimate
            </button>
          )}
        </div>
      </div>
    </div>
  );
}