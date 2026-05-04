import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import {
  extractDomainFromEmail,
  handleZohoAttachmentDownloadS3Upload,
} from "./config";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      fromAddress,
      toAddress,
      summary,
      hasAttachment,
      messageId,
      accountId,
    } = body;

    const domain = extractDomainFromEmail(toAddress);

    const isDomain = await prisma.subdomain.findFirst({
      where: {
        domain: domain,
      },
      select: { id: true },
    });

    if (!isDomain) {
      console.warn("Not Admin Domain");
      return NextResponse.json({ message: "Not admin domain" }, { status: 200 });
    }

    const existingClient = await prisma.demoClient.findFirst({
      where: {
        email: fromAddress,
      },
      select: {
        id: true,
      },
    });

    if (!existingClient) {
      console.warn("Not a client")
      return NextResponse.json({ message: "Not a client" }, { status: 200 });
    }

    const communication = await prisma.clientCommunication.create({
      data: {
        body: summary,
        role: "CLIENT",
        type: "EMAIL",
        demoClient: { connect: { id: existingClient.id } },
      },
    });

    if (hasAttachment) {
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

    console.log("Zoho Mail Webhook:", body);
    return NextResponse.json({ message: "Success" }, { status: 200 });
  } catch (error) {
    console.warn("Webhook Error:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 },
    );
  }
}