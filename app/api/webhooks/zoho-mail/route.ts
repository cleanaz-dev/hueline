import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { handleZohoAttachmentDownloadS3Upload } from "./config";

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

    // Parse +tag from toAddress → slug + customerId
    const cleanTo = toAddress.replace(/[<>]/g, "");
    const tagMatch = cleanTo.match(/\+([^@]+)@/);

    if (!tagMatch) {
      console.warn("No +tag found in toAddress");
      return NextResponse.json(
        { message: "Invalid address format" },
        { status: 200 },
      );
    }

    const [threadId, slug] = tagMatch[1].split("_");

    if (!threadId || !slug) {
      console.warn("Could not parse slug or customerId from tag");
      return NextResponse.json(
        { message: "Invalid tag format" },
        { status: 200 },
      );
    }

    // Verify customer exists under this subdomain
    const thread = await prisma.chatThread.findUnique({
      where: { id: threadId },
      select: {
        customer: true,
        subdomainId: true,
      },
    });

    if (!thread?.customer || !thread.customer.id || !thread.subdomainId) {
      console.warn("Customer not found for", {
        slug,
        thread: thread?.customer.id,
      });
      return NextResponse.json(
        { message: "Customer not found" },
        { status: 200 },
      );
    }

    const activity = await prisma.clientActivity.create({
      data: {
        type: "INBOUND_EMAIL",
        subDomain: { connect: { id: thread.subdomainId } },
        customer: { connect: { id: thread.customer.id } },
        chatThreadId: threadId,
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
        fromEmail: fromAddress,
        customer: { connect: { id: thread.customer.id } },
        chatThreadId: threadId,
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

    return NextResponse.json({ message: "Success" }, { status: 200 });
  } catch (error) {
    console.warn("Webhook Error:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 },
    );
  }
}
