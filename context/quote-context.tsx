"use client"

import { Quote } from "@/app/generated/prisma/client";
import { createContext, useContext, useState, ReactNode, useEffect, useRef } from "react";
import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface QuoteContextType {
  quote: Quote | null;
  isLoading: boolean;
  error: any;
  generatingQuote: boolean; 
  slug: string;
  handleQuoteGeneration: (quoteId: string) => Promise<void>;
}

const QuoteContext = createContext<QuoteContextType | undefined>(undefined);

interface QuoteProviderProps {
  children: ReactNode;
  slug: string;
  quoteId?: string;
}

export function QuoteProvider({ children, slug, quoteId }: QuoteProviderProps) {
  // 1. Local state for instant UI feedback
  const [localGenerating, setLocalGenerating] = useState<boolean>(false);

  // 2. Main Quote Fetcher
  const { data, error, isLoading, mutate: mutateQuote } = useSWR(
    quoteId ? `/api/subdomain/${slug}/quotes/${quoteId}` : null,
    fetcher
  );

  const quote = data?.quote || null;

  // 3. Global Lock Fetcher (Redis)
  const { data: lockData, mutate: mutateLock } = useSWR(
    quoteId ? `/api/subdomain/${slug}/check-lock/${quoteId}?context=QUOTE` : null,
    fetcher,
    {
      refreshInterval: (currentData) => (currentData?.isGenerating ? 3000 : 15000),
    }
  );

  const isGlobalGenerating = lockData?.isGenerating === true;

  // Combine local and global state: true if EITHER is happening
  const generatingQuote = localGenerating || isGlobalGenerating;

  // 4. Auto-refresh Quote Data when Global Lock is released
  const prevLockRef = useRef(isGlobalGenerating);
  
  useEffect(() => {
    // If the lock was previously TRUE, and is now FALSE, generation just finished!
    if (prevLockRef.current === true && isGlobalGenerating === false) {
      
      // mutateQuote() refetches the updated quote data.
      // We wait for it to finish BEFORE dropping the loading skeleton.
      mutateQuote().then(() => {
        setLocalGenerating(false); // Reset local state so the skeleton disappears
      });
      
    }
    prevLockRef.current = isGlobalGenerating;
  }, [isGlobalGenerating, mutateQuote]);

  // 5. Handle Generation Click
  const handleQuoteGeneration = async (quoteId: string) => {
    setLocalGenerating(true);
    
    // Optimistically tell SWR the lock is active so the UI updates instantly
    mutateLock({ isGenerating: true }, false); 

    try {
      const response = await fetch(`/api/subdomain/${slug}/quotes/${quoteId}/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quoteId }),
      });

      if (!response.ok) {
        const result = await response.json();
        console.error("Error generating quote:", result.error || result.message);
        
        // Revert UI states if it fails immediately
        setLocalGenerating(false);
        mutateLock(); 
      }
      
      // NOTE: On success, we DO NOT set `localGenerating(false)` here!
      // We leave it true so the skeleton keeps spinning while the background task runs.
      // The `useEffect` above will automatically drop the loading state and show the new items 
      // once the Redis lock is removed.

    } catch (err) {
      console.error("Network error:", err);
      setLocalGenerating(false);
      mutateLock(); 
    }
  };

  return (
    <QuoteContext.Provider
      value={{
        quote,
        isLoading,
        error,
        generatingQuote, 
        slug,
        handleQuoteGeneration,
      }}
    >
      {children}
    </QuoteContext.Provider>
  );
}

export function useQuote() {
  const context = useContext(QuoteContext);
  if (context === undefined) throw new Error("useQuote must be used within a QuoteProvider");
  return context;
}