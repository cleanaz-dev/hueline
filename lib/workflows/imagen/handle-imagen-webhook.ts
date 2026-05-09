import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getPresignedUrl } from "@/lib/aws/s3";
import { processImagenWorkflow, ImagenTriggerSource } from "./process-imagen-workflow";
import { Job, DemoClient } from "@/app/generated/prisma"; 

export async function handleImagenWebhook(
  body: any,           
  triggerSource: ImagenTriggerSource,
  job: Job,                   // 🌟 Pass Job cleanly
  demoClient: DemoClient      // 🌟 Pass DemoClient cleanly
) {
  try {
    const { s3Key, brand, color, targetColor, roomType, action, smsBody, huelineId } = body;

    if (!s3Key) return NextResponse.json({ message: "Missing s3Key" }, { status: 400 });

    const presignedUrl = await getPresignedUrl(s3Key);

    // 🌟 No need to extract demoClient from job anymore, we just use the parameter!
    if (!demoClient.phone) return NextResponse.json({ message: "No phone number" }, { status: 400 });

    await prisma.job.update({ where: { id: job.id }, data: { status: "SUCCESS" } });

    const deliveryMethod = demoClient.email ? "BOTH" : "SMS"; 
    const clientName = demoClient.name || "Client";

    // ─────────────────────────────────────────────────────────────────
    // PATH A: FOLLOW-UP ACTION // FIX CODE TO UPDATE IN GENERAL 
    // ─────────────────────────────────────────────────────────────────
    if (action === "followUp") {
      const subBookingData = await prisma.subBookingData.update({
        where: { huelineId },
        include: { subdomain: true },
        data: {
          mockups: {
            create: {
              s3Key, roomType,
              brand: targetColor.brand ?? "RAL",
              code: targetColor.code,
              name: targetColor.name,
              hex: targetColor.hex,
            },
          },
          paintColors: {
            create: {
              brand: targetColor.brand ?? "RAL",
              code: targetColor.code,
              name: targetColor.name,
              hex: targetColor.hex,
            },
          },
        },
      });

      const portalLink = `https://${subBookingData.subdomain.slug}.hue-line.com/j/${huelineId}`;
      
      await processImagenWorkflow({
        toPhone: demoClient.phone,
        toEmail: demoClient.email,
        smsBody: `${smsBody}\n\nView your portal here: ${portalLink}`,
        emailSubject: `Your Room Preview - ${targetColor.name}`,
        emailHtml: `<p>${smsBody}</p><p><a href="${portalLink}">View your portal here</a></p>`,
        demoClientId:  demoClient.id,
        mediaData: {
          s3Key: s3Key,
          presignedUrl: presignedUrl,
          size: 0,
          fileName: `${targetColor.brand}-mockup.jpg`,
          mimeType: "image/jpeg",
        },
        role: "OPERATOR",
        metadata: { huelineId, jobId: job.id },
        triggerSource, 
        context: {
          brandName: targetColor.brand ?? "RAL",
          colorName: targetColor.name,
          colorCode: targetColor.code || "", 
          colorHex: targetColor.hex || "",
          recipientName: clientName,
          roomType: roomType,
        },
        deliveryMethod,
      });

      return NextResponse.json({ message: "Success" }, { status: 200 });
    }

    // ─────────────────────────────────────────────────────────────────
    // PATH B: DEFAULT / OPERATOR ACTION
    // ─────────────────────────────────────────────────────────────────
    const defaultBody = `Here is your new mockup featuring the ${brand} palette in ${color?.name || "your selected color"}!`;

    await processImagenWorkflow({
      toPhone: demoClient.phone,
      toEmail: demoClient.email,
      smsBody: defaultBody,
      emailSubject: `New Room Mockup - ${color?.name || brand}`,
      emailHtml: `<p>${defaultBody}</p>`,
      demoClientId: demoClient.id,
      mediaData: {
        s3Key: s3Key,
        presignedUrl: presignedUrl,
        size: 0,
        fileName: `${brand}-mockup.jpg`,
        mimeType: "image/jpeg",
      },
      role: "OPERATOR",
      metadata: { jobId: job.id },
      triggerSource, 
      context: {
        brandName: brand ?? "RAL",
        colorName: color?.name || "Selected Color",
        colorCode: color?.code || "", 
        colorHex: color?.hex || "",
        recipientName: clientName,
        roomType: roomType,
      },
      deliveryMethod,
    });

    return NextResponse.json({ message: "Mockup ingested successfully" }, { status: 200 });

  } catch (error: any) {
    console.error(`Webhook Handler Error for ${demoClient.id}:`, error.message || error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}