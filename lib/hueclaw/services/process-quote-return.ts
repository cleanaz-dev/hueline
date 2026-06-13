import { prisma } from "@/lib/prisma";
import { handlerQuoteWebhookSchema } from "@/lib/zod/quotes/handler-quote-webhook-schema";
import { handleHueClawCommunication } from "@/lib/hueclaw/handlers/communication";
import { z } from "zod";
import { hueClawQuoteMetadataSchema } from "@/lib/zod/hueclaw/quote/quote-metadata";
import { finalizeHueClawDelivery } from "../finalize-hueclaw-delivery";
import { SystemTask } from "@/app/generated/prisma";
import { sendDefaultSMS } from "@/lib/twilio/sms-default";
import { sendEmail } from "@/lib/resend";
import { SendBasicEmail } from "@/lib/resend/services/send-email";
import { hueClawQuoteResultSchema } from "@/lib/zod/hueclaw/quote/quote-result-schema";
import { connect } from "http2";

export async function processQuoteReturn(task: SystemTask, rawResult: any) {
  // 1. Unpack the backpack that handleHueClawQuote packed
  const metadata = hueClawQuoteMetadataSchema.parse(task.metadata);
  const {
    threadId,
    pendingMessage,
    paintColors,
    roomType,
    squareFeet,
    huelineId,
    quoteId,
    bookingId,
  } = metadata;

  // 2. Fetch customer
  const customer = await prisma.customer.findUnique({
    where: { id: task.customerId! },
  });
  if (!customer) throw new Error(`Customer not found for task ${task.id}`);

  const subdomain = await prisma.subdomain.findUnique({
    where: {
      id: task.subdomainId,
    },
    select: {
      id: true,
      slug: true,
    },
  });

  if (!subdomain)
    throw new Error(`Subdomain not found for ${task.subdomainId}`);

  // 3. Validate Lambda result
  const validPayload = hueClawQuoteResultSchema.parse(rawResult);

  // 4. Create Quote — no pre-generated quoteId in the HueClaw flow
  const quote = await prisma.quote.update({
    where: { id: quoteId },
    data: {
      items: validPayload.items,
      totalAmount: validPayload.totalAmount,
      version: { increment: 1 },
    },
  });

  const quoteLink = `Link to qoute https://${subdomain.slug}.hue-line.com/quote/${quote.id}`;

  // 5. DB side effects
  await prisma.$transaction(async (tx) => {
    await tx.clientActivity.create({
      data: {
        type: task.deliveryMethod === "SMS" ? "SMS_SENT" : "EMAIL_SENT",
        title: task.deliveryMethod === "SMS" ? "SMS Sent" : "Email Sent",
        description: `Quote link delivered to ${customer.name ?? "customer"} via ${task.deliveryMethod}. ${quoteLink}`,
        metadata: { quoteId: quote.id },
        customer: { connect: { id: customer.id } },
        subDomain: { connect: { id: task.subdomainId } },
        chatThread: { connect: { id: threadId } },
      },
    });
   await tx.clientCommunication.create({
      data: {
        body: pendingMessage.msgBody!,
        role: "AI",
        type: "QUOTE",
        ...(pendingMessage.deliveryMethod === "EMAIL" && {
          subject: pendingMessage.msgSubject,
        }),
        customer: { connect: { id: customer.id } },
        chatThread: { connect: { id: threadId } },
      },
    });

    await tx.clientActivity.create({
      data: {
        type: "QUOTE_GENERATION",
        title: `Automated Quote Generated: $${validPayload.totalAmount.toFixed(2)}`,
        description: `An automated quote for ${validPayload.items.length} items was generated for ${customer.name ?? ""} (via ${task.deliveryMethod}). ${quoteLink}`,
        metadata: { huelineId: metadata.huelineId, jobId: task.id, quoteId: quote.id },
        customer: { connect: { id: customer.id } },
        subDomain: { connect: { id: task.subdomainId } },
        chatThread: { connect: { id: threadId } },
      },
    });

    await tx.logs.create({
      data: {
        title: `Automated Quote Generated for ${customer.name ?? ""}`,
        type: "QUOTE",
        actor: "SYSTEM",
        description: `An automated quote for ${validPayload.items.length} items totaling $${validPayload.totalAmount.toFixed(2)} was generated (via ${task.deliveryMethod}).`,
        subdomain: { connect: { id: task.subdomainId } },
      },
    });
  });

  // Need to create a generic handler to send SMS or EMAILS
  if (task.deliveryMethod === "SMS") {
    await sendDefaultSMS({
      to: customer.phone!,
      body: `${pendingMessage.msgBody!} ${quoteLink}`,
    });
  } else if (task.deliveryMethod === "EMAIL") {
    const htmlBody = pendingMessage.msgBody!.replace(
      "{{QUOTE_LINK}}",
      quoteLink,
    );

    await sendEmail({
      to: customer.email!,
      subject: pendingMessage.msgSubject!,
      template: SendBasicEmail({
        subject: pendingMessage.msgSubject!,
        body: htmlBody,
      }),
    });
  }

  return {
    releaseLock: true,
    threadId,
    message: "Quote processed, saved, and HueClaw comms delivered.",
  };
}
