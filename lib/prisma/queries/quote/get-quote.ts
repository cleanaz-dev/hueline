import { prisma } from "../../config";
import { Prisma } from "@/app/generated/prisma/client";

export const getQuoteSelections = {
  booking: {
    include: {
      mockups: true,
      paintColors: true,
      subdomain: true,
    },
  },
  customer: true,
} satisfies Prisma.QuoteInclude;

export async function getQuote(quoteId: string) {
  const quote = await prisma.quote.findUnique({
    where: { id: quoteId },
    include: getQuoteSelections,
  });

  return quote;
}

export type QuoteData = Awaited<ReturnType<typeof getQuote>>;