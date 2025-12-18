import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCallIntelligence } from "@/lib/handlers";
import { createCallIngestLog } from "@/lib/prisma/mutations/logs/create-call-log";

interface Params {
  params: Promise<{
    slug: string;
  }>;
}

export async function POST(req: Request, { params }: Params) {
  try {
    const { slug } = await params;

    if (!slug)
      return NextResponse.json({ message: "Invalid Request" }, { status: 400 });
    // 1. Security Check
    const apiKey = req.headers.get("x-api-key");
    if (apiKey !== process.env.INTERNAL_API_KEY) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Parse the Python Payload (snake_case)
    const body = await req.json();
    console.log("📦 Ingest Body:", body);

    console.log("📥 Ingesting Booking:", body.hueline_id);

    // 3. Validate Subdomain Logic
    // Prefer ID if available, fallback to slug
    let subdomainId = body.subdomain_id;

    if (!subdomainId && body.slug) {
      const sub = await prisma.subdomain.findUnique({
        where: { slug: body.slug },
      });
      if (sub) subdomainId = sub.id;
    }

    if (!subdomainId) {
      return NextResponse.json(
        { error: "Invalid Subdomain ID or Slug" },
        { status: 400 }
      );
    }

    // 4. Save to MongoDB (Mapping snake_case -> camelCase)
    const booking = await prisma.subBookingData.upsert({
      where: { huelineId: body.hueline_id },
      update: {
        pin: body.pin,
        name: body.name,
        phone: body.phone || "No Phone",
        roomType: body.room_type,
        prompt: body.prompt,
        originalImages: body.original_images,
        summary: body.summary,
        dimensions: body.dimensions,
        dateTime: new Date(body.date_time),

        // Update nested relations on update
        calls: {
          create: {
            callSid: body.call_sid,
            duration: body.call_duration,
          },
        },

        mockups: {
          create: body.mockup_urls.map((m: any) => ({
            s3Key: m.s3_key,
            roomType: m.room_type,
            presignedUrl: m.presigned_url,
            colorRal: m.color.ral,
            colorName: m.color.name,
            colorHex: m.color.hex,
          })),
        },

        paintColors: {
          create: body.paint_colors.map((c: any) => ({
            ral: c.ral,
            name: c.name,
            hex: c.hex,
          })),
        },
      },
      create: {
        huelineId: body.hueline_id,
        subdomainId: subdomainId,

        name: body.name,
        phone: body.phone || "No Phone",
        roomType: body.room_type,
        prompt: body.prompt,
        originalImages: body.original_images,
        summary: body.summary,
        dimensions: body.dimensions,
        dateTime: new Date(body.date_time),
        pin: body.pin,
        expiresAt: Math.floor(Date.now() / 1000) + 72 * 60 * 60,

        calls: {
          create: {
            callSid: body.call_sid,
            duration: body.call_duration,
          },
        },

        mockups: {
          create: body.mockup_urls.map((m: any) => ({
            s3Key: m.s3_key,
            roomType: m.room_type,
            presignedUrl: m.presigned_url,
            colorRal: m.color.ral,
            colorName: m.color.name,
            colorHex: m.color.hex,
          })),
        },

        paintColors: {
          create: body.paint_colors.map((c: any) => ({
            ral: c.ral,
            name: c.name,
            hex: c.hex,
          })),
        },
      },
    });

    await createCallIngestLog({
      bookingDataId: booking.id,
      subdomainId: subdomainId,
      callSid: body.call_sid,
      duration: body.call_duration,
      customerName: body.name,
      customerPhone: body.phone || "No Phone",
      roomType: body.room_type,
    });

    await getCallIntelligence({
      hueline_id: body.hueline_id,
      call_sid: body.call_sid,
      domain_id: body.subdomain_id,
      slug: body.slug,
    });

    return NextResponse.json({
      success: true,
      id: booking.id,
      pin: booking.pin,
    });
  } catch (error) {
    console.error("❌ Ingest Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
