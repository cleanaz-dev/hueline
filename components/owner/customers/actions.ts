"use server";

import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export async function createOrOpenQuote(customerId: string, huelineId: string) {
  // 1. Check if a DRAFT quote already exists for this specific booking
  let quote = await prisma.quote.findFirst({
    where: {
      huelineId: huelineId,
      status: "DRAFT",
      customerId,
    },
  });

  // 2. If no draft exists, generate a new MongoDB record
  if (!quote) {
    quote = await prisma.quote.create({
      data: {
        huelineId: huelineId,
        customer: { connect: { id: customerId } },
        booking: { connect: { huelineId } },
        status: "DRAFT",
        items: [], // Initialize empty items JSON array
      },
    });
  }

  // 3. Redirect the user to the dynamic quote builder page
  redirect(`/quote/${quote.id}`);
}
