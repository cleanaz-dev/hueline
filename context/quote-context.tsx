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

interface QuoteContextType {
  quote: Quote | null;
  isLoading: boolean;
  error: any;
  generatingQuote: boolean;
  slug: string; // Expose the slug just in case child components need it
  handleQuoteGeneration: (quoteId: string) => Promise<void>;
}

const QuoteContext = createContext<QuoteContextType | undefined>(undefined);

// 1. Add slug to the Provider props
interface QuoteProviderProps {
  children: ReactNode;
  slug: string; 
}

export function QuoteProvider({ children, slug }: QuoteProviderProps) {
  const [quote, setQuote] = useState<Quote | null>(null);
  const [generatingQuote, setGeneratingQuote] = useState<boolean>(false);
  
  // 2. SWR can fetch instantly because `slug` is already available from props!
  const { data, error, isLoading } = useSWR(
    `/api/subdomain/${slug}/quote/current`, 
    fetcher
  );
    
  useEffect(() => {
    if (data?.quote) {
      setQuote(data.quote);
    }
  }, [data]);

  const handleQuoteGeneration = async (quoteId: string) => {
    setGeneratingQuote(true);
    try {
      // 3. Use the slug prop directly in your API call
      const response = await fetch(`/api/subdomain/${slug}/quotes/${quoteId}/generate`, {
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

  return (
    <QuoteContext.Provider 
      value={{ 
        quote, 
        isLoading, 
        error,
        generatingQuote,
        slug,
        handleQuoteGeneration
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