"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import { prisma } from "@/lib/prisma";

export async function createNoteLog(huelineId: string, content: string) {
  const session = await getServerSession(authOptions);
  if (!session) throw new Error("Unauthorized");

  // Determine Actor: If they are a 'customer', it's CLIENT. If Admin/Member, it's PAINTER.
  const actor = session.role === "customer" ? "CLIENT" : "PAINTER";

  try {
    const booking = await prisma.subBookingData.findUnique({
      where: { huelineId },
      select: { id: true, subdomainId: true },
    });

    if (!booking) throw new Error("Booking not found");

    await prisma.logs.create({
      data: {
        bookingDataId: booking.id,
        subdomainId: booking.subdomainId,
        type: "NOTE",
        actor: actor,
        title: "Note Added",
        description: content,
        metadata: {
            authorName: session.user?.name || session.user?.email || "Unknown"
        }
      },
    });
    
    return { success: true };
  } catch (error) {
    console.error("Failed to add note:", error);
    return { success: false };
  }
}