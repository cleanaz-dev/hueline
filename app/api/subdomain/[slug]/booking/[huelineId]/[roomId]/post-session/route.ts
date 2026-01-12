import { getClientPostSession } from "@/lib/prisma/queries/post-session/get-client-post-session";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface Params {
  params: Promise<{
    slug: string;
    huelineId: string;
    roomId: string;
  }>;
}

export async function GET(req: Request, { params }: Params) {
  try {
    const { huelineId, roomId, slug } = await params;

    if (!huelineId || !roomId || !slug) {
      return NextResponse.json({ message: "Invalid Request" }, { status: 400 });
    }

    const data = await getClientPostSession(huelineId, roomId);

    if (!data) {
      return NextResponse.json(
        { message: "Post session not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching post session:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ huelineId: string; roomId: string; slug: string }> }
) {
  try {
    const { huelineId, roomId, slug } = await params;

    // 1. Parse payload from Lambda
    const body = await req.json();
    console.log("📦📦📦 Body:", body)
    const { status, image_key, area, timestamp } = body;

    if (!huelineId || !roomId || !slug) {
      return NextResponse.json({ message: "Invalid URL parameters" }, { status: 400 });
    }

    if (!image_key) {
      return NextResponse.json({ message: "No image key provided" }, { status: 400 });
    }

    // 2. Execute DB updates in a transaction for safety
    await prisma.$transaction(async (tx) => {
      
      // A. Fetch the room to get current data
      const room = await tx.room.findUnique({
        where: { roomKey: roomId },
        select: { 
          id: true, 
          scopeData: true, 
          domainId: true, 
          bookingId: true 
        }
      });

      if (!room) throw new Error("Room not found");

      // B. Update Room: Set processing to false and save the new Image Key
      // We assume scopeData is a JSON object. We verify it exists or create empty obj.
      const currentScope = (room.scopeData as Record<string, any>) || {};
      
      // Merge logic: Update the specific 'area' with the new upscaled key
      const updatedScope = {
        ...currentScope,
        [area || "main"]: {
          ...(currentScope[area || "main"] || {}),
          upscaledKey: image_key,
          upscaledAt: new Date(timestamp * 1000).toISOString(),
          status: "completed"
        }
      };

      await tx.room.update({
        where: { roomKey: roomId },
        data: {
          isProcessing: false,
          scopeData: updatedScope, // Save back to Mongo
        },
      });

      // C. Create a Log entry (so it shows up in the UI Activity Feed)
      await tx.logs.create({
        data: {
          subdomainId: room.domainId,
          bookingDataId: room.bookingId, // Link to the client booking
          type: "ROOM", // or "AI" if you prefer
          actor: "AI",
          title: "Image Upscaling Complete",
          description: `High-resolution image generated for ${area}`,
          metadata: {
            s3Key: image_key,
            area: area
          }
        }
      });
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("Error in post-session:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}