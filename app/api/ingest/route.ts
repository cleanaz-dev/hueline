import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    // 1. Security Check
    const apiKey = req.headers.get("x-api-key");
    if (apiKey !== process.env.INTERNAL_API_KEY) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Parse the Python Payload (snake_case)
    const body = await req.json();
    console.log("📦 Ingest Body:", body)
    
    console.log("📥 Ingesting Booking:", body.hueline_id);

    // 3. Validate Subdomain Logic
    // Prefer ID if available, fallback to slug
    let subdomainId = body.subdomain_id;

    if (!subdomainId && body.slug) {
      const sub = await prisma.subdomain.findUnique({
        where: { slug: body.slug }
      });
      if (sub) subdomainId = sub.id;
    }

    if (!subdomainId) {
      return NextResponse.json({ error: "Invalid Subdomain ID or Slug" }, { status: 400 });
    }

    // 4. Save to MongoDB (Mapping snake_case -> camelCase)
    const booking = await prisma.subBookingData.upsert({
      where: { huelineId: body.hueline_id }, // Assuming hueline_id is the unique ID
      update: {
        pin: body.pin,
        // Update other fields if needed on re-ingest
      },
      create: {
        huelineId: body.hueline_id,
        subdomainId: subdomainId,
        
        // Map Python keys to Prisma keys
        name: body.name,
        phone: body.phone || "No Phone", // Handle missing phone if necessary
        roomType: body.room_type,
        prompt: body.prompt,
        originalImages: body.original_images,
        summary: body.summary,
        dimensions: body.dimensions,
        dateTime: new Date(body.date_time),
        pin: body.pin,
        expiresAt: Math.floor(Date.now() / 1000) + (72 * 60 * 60), // 72 hours from now

        calls: {
          create: {
            callSid: body.call_sid,
            duration: body.call_duration
          }
        },

        // Handle Nested Arrays
        mockups: {
          create: body.mockup_urls.map((m: any) => ({
            s3Key: m.s3_key,
            roomType: m.room_type,
            presignedUrl: m.presigned_url, // Note: This might expire, S3 Key is source of truth
            colorRal: m.color.ral,
            colorName: m.color.name,
            colorHex: m.color.hex,
          }))
        },
        
        paintColors: {
          create: body.paint_colors.map((c: any) => ({
            ral: c.ral,
            name: c.name,
            hex: c.hex
          }))
        }
      }
    });

    return NextResponse.json({ 
      success: true, 
      id: booking.id, 
      pin: booking.pin 
    });

  } catch (error) {
    console.error("❌ Ingest Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}