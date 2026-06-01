"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, FileText, ArrowRight } from "lucide-react";
import { createOrOpenQuote } from "./actions";
import Link from "next/link";

export function GenerateQuoteButton({ customerId, huelineId, hasExistingQuote, quoteId }: {
    customerId: string;
    huelineId: string;
    hasExistingQuote: boolean;
    quoteId?: string;
}) {
  const router = useRouter();
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    setIsGenerating(true);
    
    try {
      const response = await createOrOpenQuote(customerId, huelineId);
      
      if (response.success) {
        // Redirect to the quote page!
        router.push(`/quote/${response.quoteId}`);
      } else {
        alert("Uh oh! Failed to process the quote.");
      }
    } finally {
      // Note: We don't necessarily set isGenerating to false here 
      // because the page will unmount during navigation, keeping the spinner active!
    }
  };

  return (
    <button 
      onClick={handleGenerate} 
      disabled={isGenerating}
      className="flex w-full bg-zinc-900 hover:bg-zinc-800 hover:cursor-pointer text-white px-5 py-2.5 rounded-xl flex items-center gap-2 disabled:opacity-80 transition-colors shadow-sm font-medium text-sm"
    >
      {isGenerating ? (
        <><Loader2 className="w-4 h-4 animate-spin" /> Processing...</>
      ) : hasExistingQuote ? (
        <><ArrowRight className="w-4 h-4" /><Link href={`/quote/${quoteId}`}>View Quote</Link></>
      ) : (
        <><FileText className="w-4 h-4" /> Generate Quote</>
      )}
    </button>
  );
}