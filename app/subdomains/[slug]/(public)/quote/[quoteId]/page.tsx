import { notFound } from "next/navigation";
import { CheckCircle, Download, Printer } from "lucide-react";
import { prisma } from "@/lib/prisma";

interface ItemProps {
  name: string;
  description: string;
  qty: string;
  price: string;
}

export default async function CustomerQuotePage({
  params,
}: {
  params: { quoteId: string };
}) {
  const quote = await prisma.quote.findUnique({
    where: { id: params.quoteId },
    include: { booking: true, customer: true }, // assuming these relations exist
  });

  if (!quote || !quote.customer || !quote.booking) notFound();

  return (
    <div className="min-h-screen bg-zinc-50 py-12 px-4 font-sans text-zinc-900">
      {/* WEB-ONLY: Top Action Bar (Hides when printing to PDF) */}
      <div className="max-w-3xl mx-auto mb-6 flex justify-between items-center print:hidden">
        <div className="text-sm font-medium text-zinc-500">
          Prepared for {quote.customer.name}
        </div>
        <button
          onClick={() => window.print()} // The easiest PDF generator ever
          className="flex items-center gap-2 bg-white border border-zinc-200 shadow-sm px-4 py-2 rounded-lg text-sm font-bold hover:bg-zinc-50 transition-all"
        >
          <Download className="w-4 h-4" />
          Save as PDF
        </button>
      </div>

      {/* THE ACTUAL QUOTE / "PAPER" */}
      <div className="max-w-3xl mx-auto bg-white border border-zinc-200 shadow-xl rounded-2xl overflow-hidden print:shadow-none print:border-none print:m-0">
        {/* Header Section */}
        <div className="bg-zinc-900 text-white p-10 flex justify-between items-end">
          <div>
            <h1 className="text-4xl font-black mb-2">HUE-LINE</h1>
            <p className="text-zinc-400 font-medium">Painting Estimate</p>
          </div>
          <div className="text-right">
            <p className="text-xl font-bold">${quote.totalAmount || "0.00"}</p>
            <p className="text-sm text-zinc-400">
              Quote #{quote.id.slice(-6).toUpperCase()}
            </p>
          </div>
        </div>

        <div className="p-10">
          {/* Include the Visualizer Images they requested! */}
          <div className="mb-10">
            <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-4">
              Proposed Vision
            </h3>
            <div className="flex gap-4">
              {/* Render the selected mockup next to the original */}
              <div className="flex-1 h-48 bg-zinc-100 rounded-xl overflow-hidden">
                <img
                  src={quote.booking.compressOriginalImages}
                  className="w-full h-full object-cover"
                />
              </div>
              {/* ... mockup image ... */}
            </div>
          </div>

          {/* Line Items Table */}
          <div className="mb-10">
            <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-4">
              Line Items
            </h3>
            <div className="border border-zinc-100 rounded-xl overflow-hidden">
              <table className="w-full text-left text-sm">
                <thead className="bg-zinc-50 text-zinc-500 font-medium border-b border-zinc-100">
                  <tr>
                    <th className="p-4">Description</th>
                    <th className="p-4 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 font-medium">
                  {quote.items?.map((item: ItemProps, i: number) => (
                    <tr key={i}>
                      <td className="p-4 text-zinc-900">{item.description}</td>
                      <td className="p-4 text-right text-zinc-900">
                        ${item.price}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* WEB-ONLY: Accept Button (Hides when printing to PDF) */}
        <div className="bg-zinc-50 p-6 border-t border-zinc-100 flex justify-end print:hidden">
          <button className="bg-[#007AFF] text-white px-8 py-3 rounded-xl font-bold shadow-md hover:bg-blue-600 transition-all flex items-center gap-2">
            <CheckCircle className="w-5 h-5" />
            Accept Estimate
          </button>
        </div>
      </div>
    </div>
  );
}
