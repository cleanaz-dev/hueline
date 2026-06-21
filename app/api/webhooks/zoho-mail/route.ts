import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { handleZohoAttachmentDownloadS3Upload } from "./config";
import axios from "axios";
import { cancelPendingFollowUp } from "@/lib/aws/event-scheduler/cancel-followups";
import { invalidateThreadCache } from "@/lib/redis/agent-context";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      fromAddress,
      toAddress,
      subject,
      summary,
      hasAttachment,
      messageId,
      accountId,
    } = body;

    console.log("Zoho Mail Webhook:", body);

    let shortId = null;

    // 1. Try parsing from the +tag in the toAddress (e.g., hello+12345@domain.com)
    const cleanTo = toAddress.replace(/[<>]/g, "");
    const tagMatch = cleanTo.match(/\+([^@]+)@/);

    if (tagMatch) {
      shortId = tagMatch[1].split("_")[0];
    }

    // 2. If no +tag found, try parsing from the Subject (e.g., "Re: Quote ref#:12345")
    if (!shortId && subject) {
      // Looks for "ref#:" (case-insensitive) followed by optional spaces, capturing the ID
      const subjectMatch = subject.match(/ref(?:#)?:\s*([a-zA-Z0-9_-]+)/i);
      if (subjectMatch) {
        shortId = subjectMatch[1];
      }
    }

    // 3. If neither worked, bail out
    if (!shortId) {
      console.warn("Could not parse shortId from address tag or subject");
      return NextResponse.json(
        { message: "Invalid format: no shortId found" },
        { status: 200 },
      );
    }

    // Verify customer exists under this subdomain
    const thread = await prisma.chatThread.findUnique({
      where: { shortId: shortId },
      select: {
        id: true,
        customer: true,
        subdomainId: true,
        isAutoPilot: true,
        subdomain: {
          select: {
            slug: true,
          },
        },
      },
    });

    if (!thread?.customer?.id || !thread?.subdomainId || !thread?.id) {
      console.warn("Thread or Customer not found for shortId:", shortId);
      return NextResponse.json(
        { message: "Customer/Thread not found" },
        { status: 200 },
      );
    }

    const activity = await prisma.clientActivity.create({
      data: {
        type: "INBOUND_EMAIL",
        subDomain: { connect: { id: thread.subdomainId } },
        customer: { connect: { id: thread.customer.id } },
        chatThread: { connect: { id: thread.id } },
        description: "Cx sent Email",
        title: "Inbound Email",
      },
    });

    const communication = await prisma.clientCommunication.create({
      data: {
        body: summary,
        subject,
        role: "CLIENT",
        type: "EMAIL",
        customer: { connect: { id: thread.customer.id } },
        chatThread: { connect: { id: thread.id } },
      },
    });

    if (hasAttachment === "Yes") {
      const attachmentResults = await handleZohoAttachmentDownloadS3Upload(
        accountId,
        messageId,
      );

      for (const attachment of attachmentResults) {
        await prisma.mediaAttachment.create({
          data: {
            filename: attachment.filename,
            mimeType: attachment.mimeType,
            size: attachment.size,
            mediaSource: "S3",
            mediaUrl: attachment.s3Key,
            zohoAttachmentId: attachment.attachmentId,
            clientCommunication: { connect: { id: communication.id } },
          },
        });
      }
    }

    // Clears Redis Thread Cache
    await invalidateThreadCache(thread.subdomain.slug, thread.id);

    if (thread.isAutoPilot) {
      const delay = Math.floor(Math.random() * 3000) + 2000;
      await new Promise((resolve) => setTimeout(resolve, delay));

      await cancelPendingFollowUp(thread.id);

      await axios.post(
        `${process.env.NEXT_PUBLIC_APP_URL}/api/subdomain/${thread.subdomain?.slug}/hue-claw/${thread.id}/nudge`,
      );

      return NextResponse.json({ success: true, message: "Auto Pilot ON" });
    }

    return NextResponse.json({ message: "Success" }, { status: 200 });
  } catch (error) {
    console.warn("Webhook Error:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 },
    );
  }
}
