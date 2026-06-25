import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getRedisClient } from "@/lib/redis";
import { twilioClient } from "@/lib/twilio/config";
import { invalidateThreadCache } from "@/lib/redis/agent-context";
import { pusherServer } from "@/lib/pusher/pusher-server";
import { debounceAndNudgeAI } from "@/lib/hueclaw/services/ai-nudge";
import { 
  processMediaUrl, 
  type ProcessedMedia 
} from "@/lib/hueclaw/services/image-compressor";
import { VisionTags, analyzeImageWithVision } from "@/lib/hueclaw/services/vision-analyzer";

interface Params {
  params: Promise<{ slug: string; twilioNumber: string }>;
}

const MAX_MESSAGES_PER_HOUR = 10;

function normalizePhone(phone: string) {
  return phone.replace(/\D/g, "");
}

export async function POST(req: Request, { params }: Params) {
  const redis = await getRedisClient();

  try {
    const { slug, twilioNumber: rawTwilioNumber } = await params;
    const twilioNumber = decodeURIComponent(rawTwilioNumber);
    const { incomingPhone, incomingMessage, mediaUrls = [] } = await req.json();

    console.log(incomingPhone, incomingMessage, mediaUrls);

    // 1. FIXED VALIDATION: Allow request if it has EITHER a message OR media
    const hasText = incomingMessage && incomingMessage.trim().length > 0;
    const hasMedia = mediaUrls && mediaUrls.length > 0;

    if (!incomingPhone || !slug || (!hasText && !hasMedia)) {
      return NextResponse.json({ error: "Missing data" }, { status: 400 });
    }

    // 2. Make sure this number actually belongs to the subdomain
    const subdomain = await prisma.subdomain.findUnique({
      where: { slug },
      select: { id: true, twilioPhoneNumber: true },
    });

    if (!subdomain || !subdomain.twilioPhoneNumber) {
      return NextResponse.json(
        { error: "Required Subdomain data not found" },
        { status: 404 }
      );
    }

    if (
      normalizePhone(subdomain.twilioPhoneNumber) !==
      normalizePhone(twilioNumber)
    ) {
      return NextResponse.json(
        { error: "Invalid Twilio number for this subdomain" },
        { status: 401 }
      );
    }

    // 3. Rate limit per customer
    const rateKey = `sms_limit:${slug}:${normalizePhone(incomingPhone)}`;
    const count = await redis.incr(rateKey);
    if (count === 1) await redis.expire(rateKey, 3600);

    if (count > MAX_MESSAGES_PER_HOUR) {
      if (count === MAX_MESSAGES_PER_HOUR + 1) {
        await twilioClient.messages.create({
          body: "You've reached the messaging limit. Please book a meeting to continue!",
          from: twilioNumber,
          to: incomingPhone,
        });
      }
      return NextResponse.json({ success: true, message: "Rate limited" });
    }

    // 4. Find customer + open thread
    const customer = await prisma.customer.findFirst({
      where: { phone: incomingPhone, subdomain: { slug } },
    });

    if (!customer) {
      console.warn(
        `[incoming-sms] Unknown sender ${incomingPhone} for ${slug}`
      );
      return NextResponse.json({
        success: true,
        message: "Unknown sender dropped",
      });
    }

    const thread = await prisma.chatThread.findFirst({
      where: { customerId: customer.id, status: "OPEN" },
    });

    if (!thread) {
      console.warn(`[incoming-sms] No open thread for ${customer.name}`);
      return NextResponse.json({ success: true, message: "No open thread" });
    }

    // ==========================================
    // 5. PROCESS IMAGES VIA LAMBDA IN PARALLEL
    // ==========================================
    const mediaResults = await Promise.all(
      mediaUrls.map((url: string) =>
        processMediaUrl(url, subdomain.id, customer.id)
      )
    );

    const errorResponse = mediaResults.find((result) => result instanceof NextResponse);
    if (errorResponse) {
      console.error("[incoming-sms] Media processing failed, aborting request.");
      return errorResponse; 
    }

    const processedMedia = mediaResults as ProcessedMedia[];

    // ==========================================
    // 5.5. RUN FAST VISION MODEL ON IMAGES (Cleaned up!)
    // ==========================================
    let visionDescription = "";
    let firstImageMetadata: any = undefined; 

    if (processedMedia.length > 0) {
      const targetKey = processedMedia[0].compressedKey || processedMedia[0].originalKey;
      const visionTags = await analyzeImageWithVision(targetKey);

      if (visionTags) {
        firstImageMetadata = { visionTags };
        
        // Context injection for DeepSeek v4 Pro
        visionDescription = `\n[SYSTEM TAG: User attached an image of a ${visionTags.room_type}. Description: ${visionTags.description}. Paintable: ${visionTags.paintable}]`;
      }
    }

    const finalMessageBody = (hasText ? incomingMessage : "[Image Attached]") + visionDescription;

    // ==========================================
    // 6. PERSIST DATA IN PARALLEL
    // ==========================================
    await Promise.all([
      prisma.clientActivity.create({
        data: {
          type: "SMS_INBOUND",
          customer: { connect: { id: customer.id } },
          subDomain: { connect: { id: customer.subdomainId! } },
          chatThread: { connect: { id: thread.id } },
          description: `Inbound SMS from ${customer.name}${processedMedia.length > 0 ? " (with Media)" : ""}`,
          title: "Inbound SMS",
        },
      }),

      prisma.clientCommunication.create({
        data: {
          body: finalMessageBody,
          role: "CLIENT",
          type: "SMS",
          customer: { connect: { id: customer.id } },
          chatThread: { connect: { id: thread.id } },
          mediaAttachments:
            processedMedia.length > 0
              ? {
                  create: processedMedia.map((media) => ({
                    filename: media.filename,
                    mimeType: media.mimeType,
                    size: media.size,
                    mediaSource: "S3",
                    mediaUrl: media.originalKey,
                    compressedKey: media.compressedKey,
                  })),
                }
              : undefined,
        },
      }),

      prisma.logs.create({
        data: {
          title: "Inbound SMS",
          type: "SMS",
          actor: "CLIENT",
          subdomain: { connect: { id: customer.subdomainId! } },
          description: "Inbound SMS",
        },
      }),
      
      ...processedMedia.map((media, index) =>
        prisma.mediaAsset.create({
          data: {
            fileName: media.filename,
            fileType: "IMAGE",
            s3Key: media.originalKey,
            compressedKey: media.compressedKey,
            metadata: index === 0 ? firstImageMetadata : undefined,
            customer: { connect: { id: customer.id } },
            subdomain: { connect: { id: subdomain.id } },
            thread: { connect: { id: thread.id } },
          },
        })
      )
    ]);
    // 7. Clear Cache & Trigger Pusher
    await invalidateThreadCache(slug, thread.id);

    try {
      await pusherServer.trigger(`thread-${thread.id}`, "new-message", {
        threadId: thread.id,
      });
    } catch (pusherErr) {
      console.error("Failed to trigger pusher for new message", pusherErr);
    }

    // 8. AutoPilot Debounce Logic
    if (thread.isAutoPilot) {
      await debounceAndNudgeAI(thread.id, slug);
      return NextResponse.json({
        success: true,
        message: "Auto Pilot ON (Debounced)",
      });
    }

    return NextResponse.json({ success: true, threadId: thread.id });
  } catch (error) {
    console.error("[incoming-sms] Internal error:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}