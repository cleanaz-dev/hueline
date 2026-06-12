import { Customer } from "@/app/generated/prisma";
import { getPresignedUrl } from "../aws/s3";
import { SendImageSMS } from "../twilio/twilio-send-image";
import { sendEmailWithAttachment } from "../resend/send-image-email";
import { HueClawEmailTemplate } from "../resend/hue-claw/hueclaw-email-template";
import { prisma } from "../prisma";

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
  portalLink?: string | null | undefined;
  threadId: string;
  newImagenCompressedKey?: string;
  newImagenKey?: string;
  color: ImagenColor;
};

export async function finalizeHueClawDelivery({
  pendingMessage,
  images,
  customer,
  portalLink,
  threadId,
  newImagenKey,
  newImagenCompressedKey,
  color,
}: FinalizeArgs) {
  const imageUrl = await getPresignedUrl(images);

  if (pendingMessage.deliveryMethod === "SMS") {
    const body = portalLink
      ? `${pendingMessage.msgBody}\n\nView on your portal: ${portalLink}`
      : pendingMessage.msgBody!;

    await SendImageSMS({
      to: customer?.phone!,
      body,
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

  await prisma.clientActivity.create({
    data: {
      type: pendingMessage.deliveryMethod === "SMS" ? "SMS_SENT" : "EMAIL_SENT",
      chatThread: { connect: { id: threadId } },
      customer: { connect: { id: customer?.id } },
      description: "SMS sent with Image and Portal link",
      title: "SMS SENT",
      subDomain: { connect: { id: customer?.subdomainId! } },
    },
  });

  await prisma.clientCommunication.create({
    data: {
      body: pendingMessage.msgBody!,
      ...(pendingMessage.msgSubject && { subject: pendingMessage.msgSubject }),
      role: "AI",
      type: "SMS",
      chatThread: { connect: { id: threadId } },
      customer: { connect: { id: customer?.id } },
      mediaAttachments: {
        create: {
          filename: `${color.brand}-${color.name}-${color.code}-mockup.png`,
          size: 0,
          mimeType: "image/png",
          mediaSource: "S3",
          mediaUrl: newImagenKey!,
          compressedKey: newImagenCompressedKey,
        },
      },
    },
  });
}
