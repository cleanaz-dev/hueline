import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import axios from "axios";
import { pickColor } from "@/lib/moonshot/services/pick-color";
import { getPresignedUrl } from "@/lib/aws/s3";

const LAMBDA_URL = process.env.LAMBDA_IMAGEN_URL!;
const apiKey = process.env.INTERNAL_API_KEY!;

export async function POST(req: Request) {
  const authHeaders = req.headers.get("x-api-key");
  if (!authHeaders || authHeaders !== apiKey) {
    return NextResponse.json(
      { message: "Unauthorized Request" },
      { status: 401 },
    );
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
            mockups: true,
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
      if (!subData || !subData.originalImages) {
        console.warn(`Skipping client ${client.id}: No original image found.`);
        continue;
      }

      try {
        const presignedUrl = await getPresignedUrl(
          subData.originalImages,
          3600,
        );

        // --- B: Build a clean, UNIQUE color list from ALL sources ---
        const rawColors = [
          ...subData.paintColors.map((pc: any) => ({
            name: pc.name,
            hex: pc.hex,
            brand: pc.brand,
            code: pc.code,
          })),
          ...subData.mockups.map((m: any) => ({
            name: m.name,
            hex: m.hex,
            code: m.code,
            brand: m.brand,
          })),
        ];

        // Deduplicate by HEX code so the AI doesn't get confused by repeats
        const uniqueColors = Array.from(
          new Map(rawColors.map((c) => [c.hex, c])).values(),
        );

        let smartColor = await pickColor(uniqueColors);
        if (!smartColor) {
          smartColor = {
            name: "Hale Navy",
            code: "HC-154",
            hex: "#3b444b",
            brand: "Benjamin Moore",
          };
        }

        const job = await prisma.job.create({
          data: {
            initiator: "SYSTEM",
            jobType: "IMAGEN",
            brand: smartColor.brand,
            name: smartColor.name,
            code: smartColor.code,
            hex: smartColor.hex,
            cost: 0.13,
            deliveryMethod: "SMS",
            demoClient: { connect: { id: client.id } },
            huelineId: subData.huelineId,
            status: "PENDING",
            model: "openai/gtp-image-2",
          },
        });

        // --- C: Build Payload (Extremely lean now!) ---
        const payload = {
          action: "FOLLOWUP_IMAGEN",
          clientId: client.id,
          huelineId: subData.huelineId,
          roomType: subData.roomType,
          imageUrl: presignedUrl,
          targetColor: smartColor,
          jobId: job.id
        }
        // --- D: Fire Lambda ---
        const res = await axios.post(LAMBDA_URL, payload);

        // --- E: Count Successes (NO MORE DATABASE UPDATES HERE!) ---
        if (res.status === 200) {
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
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
