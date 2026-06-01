"use server";

import { prisma } from "@/lib/prisma";
import { generateQuote } from "@/lib/novita";

export async function createOrOpenQuote(customerId: string, huelineId: string) {
  try {
    // 1. Return existing DRAFT if found
    const existing = await prisma.quote.findFirst({
      where: { huelineId, status: "DRAFT", customerId },
    });
    if (existing) {
      return { success: true, quoteId: existing.id, isNew: false };
    }

    // 2. Fetch booking details
    const booking = await prisma.subBookingData.findUnique({
      where: { huelineId },
      include: { paintColors: true },
    });

    // 3. Generate quote via AI
    const { items, totalAmount } = await generateQuote({
      roomType: booking?.roomType ?? undefined,
      prompt: booking?.prompt ?? undefined,
      colorNames: booking?.paintColors?.map(c => `${c.brand} ${c.name}`).join(", "),
    });

    // 4. Save to DB
    const quote = await prisma.quote.create({
      data: {
        subdomain: {connect: { id: booking?.subdomainId ?? "" }},
        huelineId,
        customer: { connect: { id: customerId } },
        booking: { connect: { huelineId } },
        status: "DRAFT",
        items: JSON.parse(JSON.stringify(items)),
        totalAmount,
      },
    });

    return { success: true, quoteId: quote.id, isNew: true };
  } catch (error) {
    console.error("Failed to generate quote:", error);
    return { success: false, error: "Failed to generate quote" };
  }
}