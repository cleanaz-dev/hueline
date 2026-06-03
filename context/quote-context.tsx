"use client"

import { Quote } from "@/app/generated/prisma/client";
import { createContext, useContext, useState, ReactNode } from "react";
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
  const [generatingQuote, setGeneratingQuote] = useState<boolean>(false);

  const { data, error, isLoading, mutate } = useSWR(
    quoteId ? `/api/subdomain/${slug}/quotes/${quoteId}` : null,
    fetcher
  );

  const quote = data?.quote || null;

  const handleQuoteGeneration = async (quoteId: string) => {
    setGeneratingQuote(true);
    try {
      const response = await fetch(`/api/subdomain/${slug}/quotes/${quoteId}/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quoteId }),
      });

      if (response.ok) {
        const result = await response.json();
        await mutate({ quote: result.quote }, { revalidate: false });
      } else {
        const result = await response.json();
        console.error("Error generating quote:", result.error || result.message);
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