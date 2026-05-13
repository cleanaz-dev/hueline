import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import axios from "axios";
import { pickColor } from "@/lib/moonshot/services/pick-color";
import { getPresignedUrl } from "@/lib/aws/s3";
import { type LambdaImagenPayload, lambdaPayloadSchema } from "@/lib/zod";

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

    const followUps = await prisma.customer.findMany({
      where: {
        createdAt: { lte: twentyFourHoursAgo, gte: fortyEightHoursAgo },
        initialFollowUp: false,
        customerType: "DEMO",
      },
      include: {
        subBookingData: {
          include: {
            paintColors: true,
            mockups: true
          }
        },
      },
    });

    if (followUps.length === 0) {
      return NextResponse.json({ message: "No pending follow-ups." });
    }

    let successCount = 0;

    for (const client of followUps) {
      if (!client.subdomainId) {
        return NextResponse.json({ message: "Invalid Data" }, { status: 400 });
      }

      if (!client.subBookingData.length) {
        console.warn(`Skipping client ${client.id}: No subBookingData found.`);
        continue;
      }

      for (const subData of client.subBookingData) {
        if (!subData.originalImages) {
          console.warn(
            `Skipping subBookingData ${subData.id} for client ${client.id}: No original image found.`,
          );
          continue;
        }

        try {
          const presignedUrl = await getPresignedUrl(subData.originalImages, 3600);

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

          const systemTask = await prisma.systemTask.create({
            data: {
              initiator: "SYSTEM",
              type: "IMAGEN",
              brand: smartColor.brand,
              name: smartColor.name,
              code: smartColor.code,
              hex: smartColor.hex,
              cost: 0.13,
              deliveryMethod: "SMS",
              customer: { connect: { id: client.id } },
              huelineId: subData.huelineId,
              status: "PENDING",
              model: "openai/gtp-image-2",
            },
          });

          const lambdaPayload: LambdaImagenPayload = {
            action: "FOLLOWUP_IMAGEN",
            customerId: client.id,
            huelineId: subData.huelineId,
            imageUrl: presignedUrl,
            targetColor: smartColor,
            systemTaskId: systemTask.id,
            subdomainId: client.subdomainId,
          };

          const parsed = lambdaPayloadSchema.safeParse(lambdaPayload);
          if (!parsed.success) {
            console.error("Invalid payload:", parsed.error.issues);
            return NextResponse.json(
              { message: "Invalid payload" },
              { status: 400 },
            );
          }

          const res = await axios.post(LAMBDA_URL, lambdaPayload);

          if (res.status === 200) {
            successCount++;
          }
        } catch (err) {
          console.error(
            `Failed to process subBookingData ${subData.id} for client ${client.id}:`,
            err,
          );
        }
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