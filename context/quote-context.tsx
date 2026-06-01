"use client"

import { Quote } from "@/app/generated/prisma/client";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

// 1. Updated Interface to include the generation state and function
interface QuoteContextType {
  quote: Quote | null; 
  isLoading: boolean;
  error: any;
  generatingQuote: boolean;
  handleQuoteGeneration: (quoteId: string) => Promise<void>;
}

const QuoteContext = createContext<QuoteContextType | undefined>(undefined);

export function QuoteProvider({ children }: { children: ReactNode }) {
  const [quote, setQuote] = useState<Quote | null>(null);
  const [generatingQuote, setGeneratingQuote] = useState<boolean>(false);
  
  const { data, error, isLoading } = useSWR("/api/quote/current", fetcher);
    
  useEffect(() => {
    // Safely check if data and data.quote exist
    if (data?.quote) {
      setQuote(data.quote);
    }
  }, [data]);

  const handleQuoteGeneration = async (quoteId: string) => {
    setGeneratingQuote(true);
    try {
      const response = await fetch(`/api/quote/generate?quoteId=${quoteId}`, {
        method: "POST",
      });
      const result = await response.json();
      if (response.ok) {
        setQuote(result.quote);
      } else {
        console.error("Error generating quote:", result.error);
      }
    } catch (err) {
      console.error("Network error:", err);
    } finally {
      setGeneratingQuote(false);
    }
  };
  // 2. Removed the stray `}` that was right here

  return (
    <QuoteContext.Provider 
      value={{ 
        quote, 
        isLoading, 
        error,
        generatingQuote,          // 3. Exposed to children
        handleQuoteGeneration     // 3. Exposed to children
      }}
    >
      {children}
    </QuoteContext.Provider>
  );
}

export function useQuote() {
  const context = useContext(QuoteContext);
  if (context === undefined) {
    throw new Error("useQuote must be used within a QuoteProvider");
  }
  return context;
}