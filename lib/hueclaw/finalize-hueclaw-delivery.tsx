import { Customer } from "@/app/generated/prisma";
import { getPresignedUrl } from "../aws/s3";
import { SendImageSMS } from "../twilio/twilio-send-image";
import { sendEmailWithAttachment } from "../resend/send-image-email";
import { HueClawEmailTemplate } from "../resend/hue-claw/hueclaw-email-template";

export type DeliveryMethod = "SMS" | "EMAIL" | string;
export type PendingMessagePayload = {
  deliveryMethod: DeliveryMethod;
  msgBody: string | null;
  msgSubject: string | null;
};

type FinalizeArgs = {
  pendingMessage: PendingMessagePayload;
  images: string;
  customer: Customer | null;
  portalLink?: string | null | undefined
};

export async function finalizeHueClawDelivery({
  pendingMessage,
  images,
  customer,
  portalLink
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
}

