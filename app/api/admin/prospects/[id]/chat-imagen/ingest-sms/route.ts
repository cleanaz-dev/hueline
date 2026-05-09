import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getPresignedUrl } from "@/lib/aws/s3";


interface Params {
  params: Promise<{ id: string }>;
}

export async function POST(req: Request, { params }: Params) {
  const { id } = await params;

  return NextResponse.json({message: "ok"}, {status: 200})

  // try {
  //   // 1. Security Check
  //   const authHeader = req.headers.get("x-webhook-secret");
  //   if (authHeader !== process.env.LAMBDA_WEBHOOK_SECRET) {
  //     console.warn(`Unauthorized webhook attempt for prospect: ${id}`);
  //     return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  //   }

  //   // 2. Parse body
  //   const {
  //     s3Key,
  //     brand,
  //     color,
  //     targetColor,
  //     roomType,
  //     action,
  //     smsBody,
  //     huelineId,
  //     jobId,
  //   } = await req.json();

  //   if (!s3Key) return NextResponse.json({ message: "Missing s3Key" }, { status: 400 });

  //   // 3. Generate presigned URL for Twilio
  //   const presignedUrl = await getPresignedUrl(s3Key);

  //   // 4. Verify prospect exists
  //   const demoClient = await prisma.demoClient.findUnique({
  //     where: { id },
  //   });

  //   if (!demoClient) return NextResponse.json({ message: "Prospect not found" }, { status: 404 });
  //   if (!demoClient.phone) return NextResponse.json({ message: "No phone number" }, { status: 400 });

  //   const jobExist = await prisma.job.findUnique({ where: { id: jobId } });
  //   if (!jobExist) return NextResponse.json({ message: "Invalid request" }, { status: 200 });

  //   await prisma.job.update({
  //     where: { id: jobExist.id },
  //     data: { status: "COMPLETED" },
  //   });

  //   // Determine Delivery Method dynamically based on whether they have an email on file
  //   // Note: adjust `demoClient.email` to match your actual schema
  //   const deliveryMethod = demoClient.email ? "BOTH" : "SMS"; 
    
  //   // Safely get a client name for logs/emails
  //   const clientName = demoClient.name|| demoClient.name || "Client";

  //   // ─────────────────────────────────────────────────────────────────
  //   // PATH A: FOLLOW-UP ACTION
  //   // ─────────────────────────────────────────────────────────────────
  //   if (action === "followUp") {
  //     const subBookingData = await prisma.subBookingData.update({
  //       where: { huelineId },
  //       include: { subdomain: true },
  //       data: {
  //         mockups: {
  //           create: {
  //             s3Key,
  //             roomType,
  //             brand: targetColor.brand ?? "RAL",
  //             code: targetColor.code,
  //             name: targetColor.name,
  //             hex: targetColor.hex,
  //           },
  //         },
  //         paintColors: {
  //           create: {
  //             brand: targetColor.brand ?? "RAL",
  //             code: targetColor.code,
  //             name: targetColor.name,
  //             hex: targetColor.hex,
  //           },
  //         },
  //       },
  //     });

  //     const portalLink = `https://${subBookingData.subdomain.slug}.hue-line.com/j/${huelineId}`;
  //     const fullBody = `${smsBody}\n\nView your portal here: ${portalLink}`;
  //     const emailHtml = `<p>${smsBody}</p><p><a href="${portalLink}">View your portal here</a></p>`;

  //     // Kick off the unified workflow
  //     await processImagenWorkflow({
  //       toPhone: demoClient.phone,
  //       toEmail: demoClient.email,
  //       smsBody: fullBody,
  //       emailSubject: `Your Room Preview - ${targetColor.name}`,
  //       emailHtml: emailHtml,
  //       demoClientId: id,
  //       mediaData: {
  //         s3Key: s3Key,               // Permanent DB
  //         presignedUrl: presignedUrl, // Temporary Twilio URL
  //         size: 0,
  //         fileName: `${targetColor.brand}-mockup.jpg`,
  //         mimeType: "image/jpeg",
  //       },
  //       role: "OPERATOR",
  //       metadata: { huelineId, jobId },
  //       triggerSource: "CRON_FOLLOWUP",
  //       context: {
  //         brandName: targetColor.brand ?? "RAL",
  //         colorName: targetColor.name,
  //         colorHex: targetColor.hex,
  //         colorCode: targetColor.code,
  //         recipientName: clientName,
  //         roomType: roomType,
  //       },
  //       deliveryMethod,
  //     });

  //     return NextResponse.json({ message: "Success" }, { status: 200 });
  //   }

  //   // ─────────────────────────────────────────────────────────────────
  //   // PATH B: DEFAULT / OPERATOR ACTION
  //   // ─────────────────────────────────────────────────────────────────
  //   const defaultBody = `Here is your new mockup featuring the ${brand} palette in ${color?.name || "your selected color"}!`;

  //   // Kick off the unified workflow
  //   await processImagenWorkflow({
  //     toPhone: demoClient.phone,
  //     toEmail: demoClient.email,
  //     smsBody: defaultBody,
  //     emailSubject: `New Room Mockup - ${color?.name || brand}`,
  //     emailHtml: `<p>${defaultBody}</p>`,
  //     demoClientId: id,
  //     mediaData: {
  //       s3Key: s3Key,               // Permanent DB
  //       presignedUrl: presignedUrl, // Temporary Twilio URL
  //       size: 0,
  //       fileName: `${brand}-mockup.jpg`,
  //       mimeType: "image/jpeg",
  //     },
  //     role: "OPERATOR",
  //     metadata: { jobId },
  //     triggerSource: "OPERATOR_PORTAL",
  //     context: {
        
  //       brandName: brand ?? "RAL",
  //       colorName: color?.name || "Selected Color",
  //       colorHex: color?.hex || "#000000",
  //       colorCode: color?.code,
  //       recipientName: clientName,
  //       roomType: roomType,
  //     },
  //     deliveryMethod,
  //   });

  //   return NextResponse.json(
  //     { message: "Mockup ingested successfully" },
  //     { status: 200 },
  //   );
    
  // } catch (error: any) {
  //   console.error(`Ingest Webhook Error for ${id}:`, error.message || error);
  //   return NextResponse.json(
  //     { message: "Internal Server Error" },
  //     { status: 500 },
  //   );
  // }
}