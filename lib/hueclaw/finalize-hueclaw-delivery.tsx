import { Customer } from "@/app/generated/prisma";
import { getPresignedUrl } from "../aws/s3";
import { SendImageSMS } from "../twilio/twilio-send-image";
import { sendEmailWithAttachment } from "../resend/send-image-email";
import { HueClawEmailTemplate } from "../resend/hue-claw/hueclaw-email-template";
import { prisma } from "../prisma";
import { invalidateThreadCache } from "../redis/agent-context";

export type DeliveryMethod = "SMS" | "EMAIL" | string;
export type PendingMessagePayload = {
  deliveryMethod: DeliveryMethod;
  msgBody: string | null;
  msgSubject: string | null;
};

type ImagenColor = {
  brand: string;
  name: string;
  code: string;
  hex: string;
};

type FinalizeArgs = {
  pendingMessage: PendingMessagePayload;
  images: string;
  customer: Customer | null;
  threadId: string;
  newImagenCompressedKey?: string;
  newImagenKey?: string;
  color: ImagenColor;
};

export async function finalizeHueClawDelivery({
  pendingMessage,
  images,
  customer,
  threadId,
  newImagenKey,
  newImagenCompressedKey,
  color,
}: FinalizeArgs) {

  const imageUrl = await getPresignedUrl(newImagenCompressedKey!);

  if (pendingMessage.deliveryMethod === "SMS") {
    // 👈 NO MORE HARDCODED LINK! Just send the pure AI-generated text.
    await SendImageSMS({
      to: customer?.phone!,
      body: pendingMessage.msgBody!,
      imageUrl: [imageUrl],
    });
  } else {
    await sendEmailWithAttachment({
      to: customer?.email!,
      subject: pendingMessage.msgSubject!,
      attachmentType: "image",
      imageUrl,
      template: (
        <HueClawEmailTemplate
          subject={pendingMessage.msgSubject!}
          body={pendingMessage.msgBody ?? ""}
        />
      ),
    });
  }

  const thread = await prisma.chatThread.findUnique({
    where: { id: threadId },
    select: {
      id: true,
      subdomain: {
        select: {
          slug: true
        }
      }
    }
  });

  await prisma.clientActivity.create({
    data: {
      type: pendingMessage.deliveryMethod === "SMS" ? "SMS_SENT" : "EMAIL_SENT",
      chatThread: { connect: { id: threadId } },
      customer: { connect: { id: customer?.id } },
      description: `${pendingMessage.deliveryMethod} sent with Mockup Image`,
      title: `${pendingMessage.deliveryMethod} SENT`,
      subDomain: { connect: { id: customer?.subdomainId! } },
    },
  });

  await prisma.clientCommunication.create({
    data: {
      body: pendingMessage.msgBody!,
      ...(pendingMessage.msgSubject && { subject: pendingMessage.msgSubject }),
      role: "AI",
      type: pendingMessage.deliveryMethod === "SMS" ? "SMS" : "EMAIL", // 👈 Fixed this so it handles Email correctly
      chatThread: { connect: { id: threadId } },
      customer: { connect: { id: customer?.id } },
      mediaAttachments: {
        create: {
          filename: `${color.brand.replace(/\s+/g, '-')}-${color.name.replace(/\s+/g, '-')}-${color.code}-mockup.png`,
          size: 0,
          mimeType: "image/png",
          mediaSource: "S3",
          mediaUrl: newImagenKey!,
          compressedKey: newImagenCompressedKey,
        },
      },
    },
  });
  
  // Clears Redis Thread Cache
  await invalidateThreadCache(thread?.subdomain.slug!, threadId);
}