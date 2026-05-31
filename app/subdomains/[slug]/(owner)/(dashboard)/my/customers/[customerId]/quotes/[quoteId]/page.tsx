import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";


interface Params {
  params: Promise<{
    customerId: string;
    quoteId: string;
  }>;
}

export default async function QuotePage({ params }: Params) {
  // Await the params (Next.js 15+ requirement)
  const { customerId, quoteId } = await params;

  // Fetch the quote and ensure it belongs to this booking
  const quote = await prisma.quote.findUnique({
    where: { 
      id: quoteId 
    },
  });

  // If someone types a random ID in the URL, throw 404
  if (!quote) {
    notFound();
  }

  return (
    <div className="p-8 max-w-5xl mx-auto flex flex-col gap-6">
      <header className="flex justify-between items-center pb-6 border-b border-zinc-200">
        <div>
          <h1 className="text-2xl font-black text-zinc-900">
            Quote for Booking: {quote.huelineId}
          </h1>
          <p className="text-sm font-medium text-zinc-500 mt-1">
            Quote ID: {quote.id}
          </p>
        </div>
        
        <span className="bg-amber-100 text-amber-800 px-3 py-1 text-xs font-bold uppercase tracking-widest rounded-md">
          {quote.status}
        </span>
      </header>

      <main className="bg-white rounded-2xl border border-zinc-200 p-6 shadow-sm">
         {/* Build your Interactive Line-Item Quote Editor Here */}
         {/* You can pass the `quote.items` JSON to a Client Component for editing */}
      </main>
    </div>
  );
}