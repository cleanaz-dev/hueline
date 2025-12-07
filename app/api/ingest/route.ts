import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const data = await req.json();
    
    // Validate secret key so random people can't post
    if (req.headers.get("x-api-key") !== process.env.INTERNAL_API_KEY) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 1. Find the Subdomain this belongs to (based on phone/account logic)
    // For now, let's assume the JSON includes 'subdomainSlug' or we find it via an Owner lookup
    const subdomain = await prisma.subdomain.findUnique({
        where: { slug: data.subdomainSlug || "default" }
    });

    if(!subdomain) throw new Error("Subdomain not found");

    // 2. Upsert into MongoDB
    const result = await prisma.subBookingData.upsert({
      where: { bookingId: data.booking_id },
      update: {
        ...data,
        status: "CONTACT",
      },
      create: {
        bookingId: data.booking_id,
        subdomainId: subdomain.id,
        huelineId: data.huelineId,
        name: data.name,
        phone: data.phone,
        roomType: data.room_type,
        prompt: data.prompt,
        originalImages: data.original_images,
        summary: data.summary,
        pin: data.pin,
        dateTime: new Date(data.date_time),
        expiresAt: data.expires_at,
        // ... handle arrays (mockups, paintColors) via nested create or JSON
      }
    });

    return NextResponse.json({ success: true, id: result.id });
  } catch (error) {
    console.error("Ingestion failed", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}