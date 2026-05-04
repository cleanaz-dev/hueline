import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import axios from "axios";
import { pickColor } from "@/lib/moonshot/services/pick-color";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const LAMBDA_URL = process.env.LAMBDA_FOLLOWUP_URL!;
const apiKey = process.env.INTERNAL_API_KEY!;

const s3 = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export async function POST(req: Request) {
  const authHeaders = req.headers.get("x-api-key");
  if (!authHeaders || authHeaders !== apiKey) {
    return NextResponse.json({ message: "Unauthorized Request" }, { status: 401 });
  }

  try {
    const now = new Date();
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const fortyEightHoursAgo = new Date(now.getTime() - 48 * 60 * 60 * 1000);

    const followUps = await prisma.demoClient.findMany({
      where: {
        createdAt: { lte: twentyFourHoursAgo, gte: fortyEightHoursAgo },
        initialFollowUp: false,
      },
      include: {
        subBookingData: {
          include: {
            paintColors: true,
            mockups: {
              orderBy: { createdAt: "desc" },
              take: 1,
            },
          },
        },
      },
    });

    if (followUps.length === 0) {
      return NextResponse.json({ message: "No pending follow-ups." });
    }

    let successCount = 0;

    for (const client of followUps) {
      const subData = client.subBookingData;
      if (!subData) continue;

      if (!subData.originalImages) {
        console.warn(`Skipping client ${client.id}: No original image found.`);
        continue;
      }

      try {
        // --- A: Generate Presigned URL from originalImages s3Key ---
        const command = new GetObjectCommand({
          Bucket: process.env.AWS_S3_BUCKET_NAME!,
          Key: subData.originalImages,
        });
        const presignedUrl = await getSignedUrl(s3, command, { expiresIn: 3600 });

        // --- B: Build color list from ALL sources and pick smart color ---
        const usedColors = [
          ...subData.paintColors.map((pc: any) => ({ name: pc.name, hex: pc.hex })),
          ...subData.mockups.map((m: any) => ({ name: m.colorName, hex: m.colorHex })),
        ];

        let smartColor = await pickColor(usedColors);
        if (!smartColor) {
          smartColor = { name: "Hale Navy", code: "HC-154", hex: "#3b444b" };
        }

        // --- C: Build Payload ---
        const payload = {
          action: "followUp",
          clientId: client.id,
          huelineId: subData.huelineId,
          roomType: subData.roomType,
          imageUrl: presignedUrl,
          deliveryMethod: "SMS",
          targetColor: smartColor,
          body: `Hey! It's been 24 hours since you tested our demo! Based on the colors you tried earlier, our AI design assistant thought Benjamin Moore ${smartColor.name} (${smartColor.code}) would look incredible in your space. What do you think?`,
        };

        // --- D: Fire Lambda ---
        const res = await axios.post(LAMBDA_URL, payload);

        // --- E: Update DB ---
        if (res.status === 200) {
          await prisma.demoClient.update({
            where: { id: client.id },
            data: { initialFollowUp: true },
          });
          successCount++;
        }
      } catch (err) {
        console.error(`Failed to process Client ${client.id}:`, err);
      }
    }

    return NextResponse.json({
      success: true,
      attempted: followUps.length,
      successful: successCount,
    });

  } catch (error) {
    console.error("CRON Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}