import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import axios from "axios";
import { pickColor } from "@/lib/moonshot/services/pick-color"; // Adjust import path to where you saved the Moonshot function
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const LAMBDA_URL = process.env.LAMBDA_FOLLOWUP_URL!;

// 1. Initialize S3 Client once outside the handler for performance
const s3 = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export async function POST(req: Request) {

  const body = await req.json()
  console.log("Body:", body)

  return NextResponse.json({message: "ok"}, {status: 200})
  // try {
  //   // 2. Exact 24 - 48 hour window
  //   const now = new Date();
  //   const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  //   const fortyEightHoursAgo = new Date(now.getTime() - 48 * 60 * 60 * 1000);

  //   // 3. Fetch targets, including the LATEST mockup
  //   const followUps = await prisma.demoClient.findMany({
  //     where: {
  //       createdAt: { lte: twentyFourHoursAgo, gte: fortyEightHoursAgo },
  //       initialFollowUp: false,
  //     },
  //     include: {
  //       subBookingData: {
  //         include: {
  //           paintColors: true,
  //           mockups: {
  //             orderBy: { createdAt: "desc" }, // Grabs the newest one first
  //             take: 1, // We only need the latest image
  //           },
  //         },
  //       },
  //     },
  //   });

  //   if (followUps.length === 0) {
  //     return NextResponse.json({ message: "No pending follow-ups." });
  //   }

  //   let successCount = 0;

  //   // 4. Loop through and process
  //   for (const client of followUps) {
  //     const subData = client.subBookingData;
  //     if (!subData) continue;

  //     const latestMockup = subData.mockups[0];
  //     if (!latestMockup?.s3Key) {
  //       console.warn(`Skipping client ${client.id}: No S3 Key found.`);
  //       continue; // Cannot generate a mockup without a source image
  //     }

  //     try {
  //       // --- A: Generate the Presigned URL (Valid for 1 Hour) ---
  //       const command = new GetObjectCommand({
  //         Bucket: process.env.AWS_S3_BUCKET_NAME!,
  //         Key: latestMockup.s3Key,
  //       });
  //       const presignedUrl = await getSignedUrl(s3, command, { expiresIn: 3600 });

  //       // --- B: Ask Moonshot AI for the perfect pivot color ---
  //       const usedColors = subData.paintColors.map((pc: any) => ({
  //         name: pc.name,
  //         hex: pc.hex,
  //       }));
        
  //       let smartColor = await pickColor(usedColors);
  //       if (!smartColor) {
  //          // Fallback if AI times out
  //         smartColor = { name: "Hale Navy", code: "HC-154", hex: "#3b444b" };
  //       }

  //       // --- C: Build the Payload ---
  //       const payload = {
  //         action: "followUp",
  //         clientId: client.id,
  //         huelineId: subData.huelineId,
  //         imageUrl: presignedUrl, // <--- Sent to Lambda!
  //         deliveryMethod: "SMS",
  //         targetColor: smartColor,
  //         body: `Hey! It's been 24 hours since you tested the AI. Based on the colors you tried earlier, our AI design assistant thought Benjamin Moore ${smartColor.name} (${smartColor.code}) would look incredible in your space. What do you think?`,
  //       };

  //       // --- D: Fire Lambda ---
  //       const res = await axios.post(LAMBDA_URL, payload);

  //       // --- E: If successful, update the DB ---
  //       if (res.status === 200) {
  //         await prisma.demoClient.update({
  //           where: { id: client.id },
  //           data: { initialFollowUp: true },
  //         });
  //         successCount++;
  //       }
  //     } catch (err) {
  //       console.error(`Failed to process Client ${client.id}:`, err);
  //     }
  //   }

  //   return NextResponse.json({ 
  //     success: true, 
  //     attempted: followUps.length, 
  //     successful: successCount 
  //   });

  // } catch (error) {
  //   console.error("CRON Error:", error);
  //   return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  // }
}