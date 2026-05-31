import { prisma } from "../../config";

export async function getQuote(quoteId: string) {
  const quote = await prisma.quote.findUnique({  // Add 'return' here
    where: {
      id: quoteId,
    },
    include: {
      booking: {
        include: {
          mockups: true,
          paintColors: true,
          subdomain: true,
        },
      },
      customer: true,
    },
  });

  return quote
}

export type QuoteData = Awaited<ReturnType<typeof getQuote>>;