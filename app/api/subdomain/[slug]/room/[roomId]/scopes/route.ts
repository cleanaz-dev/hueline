// app/api/subdomain/[slug]/room/[roomId]/scopes/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { ScopeItem, ScopeType } from "@/types/room-types"; // Ensure this path matches your project

interface RouteParams {
  params: Promise<{
    slug: string;
    roomId: string;
  }>;
}

// 1. Initialize S3 Client
const s3Client = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export async function GET(req: Request, { params }: RouteParams) {
  try {
    const { slug, roomId } = await params;

    // 2. Fetch Room Data
    const room = await prisma.room.findFirst({
      where: {
        roomKey: roomId,
        domain: {
          slug: slug,
        },
      },
      select: {
        id: true,
        scopeData: true,
        status: true,
        clientName: true,
        recordingUrl: true
      },
    });

    if (!room) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }

    // 3. Extract S3 Keys
    // Cast scopeData to your type (Prisma returns it as JsonValue)
    const scopeItems = (room.scopeData as unknown as ScopeItem[]) || [];
    const s3Keys = new Set<string>();

    scopeItems.forEach((item) => {
      if (item.type === ScopeType.IMAGE && item.image_urls) {
        item.image_urls.forEach((key) => s3Keys.add(key));
      }
    });

    // 4. Generate Presigned URLs
    const urlMap: Record<string, string> = {};

    if (s3Keys.size > 0) {
      await Promise.all(
        Array.from(s3Keys).map(async (key) => {
          try {
            const command = new GetObjectCommand({
              Bucket: process.env.AWS_S3_BUCKET_NAME!,
              Key: key,
            });
            // URL valid for 1 hour (3600 seconds)
            const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
            urlMap[key] = url;
          } catch (err) {
            console.error(`Failed to sign URL for key: ${key}`, err);
          }
        })
      );
    }
    console.log(urlMap)

    // 5. Return Room Data + Signed URLs
    // We do NOT modify scopeData keys here; we just pass the map alongside it.
    return NextResponse.json({
      ...room,
      presignedUrls: urlMap, 
    });

  } catch (error) {
    console.error("Scope GET Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// 2. PATCH: Your existing update logic (cleaned up)
export async function PATCH(req: Request, { params }: RouteParams) {
  try {
    const { slug, roomId } = await params;
    const body = await req.json();
    const { scopeData, status, name } = body;

    // Verify room exists
    const existingRoom = await prisma.room.findFirst({
      where: {
        roomKey: roomId,
        domain: { slug: slug },
      },
    });

    if (!existingRoom) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }

    // Update using the internal _id found above
    const updatedRoom = await prisma.room.update({
      where: { id: existingRoom.id },
      data: {
        ...(scopeData !== undefined && { scopeData }),
        ...(status !== undefined && { status }),
        ...(name !== undefined && { clientName: name }),
      },
    });

    return NextResponse.json(updatedRoom);
  } catch (error) {
    console.error("[ROOM_PATCH_ERROR]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}