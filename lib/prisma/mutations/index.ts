import { prisma } from "../../prisma";
import { sendBookingNotification } from "../../slack/send-booking-notification";
import { sendSmsNotification } from "../../aws/send-sms-notification";

interface BookingData {
  name: string;
  phone: string;
  sessionId: string;
  createdAt?: Date;
}

interface SubDomainData {
  companyName: string;
  slug: string;
  projectUrl?: string;
  logo?: string;
  splashScreen?: string;
  theme?: {
    primaryColor?: string;
    secondaryColor?: string;
    font?: string;
    [key: string]: string | undefined;
  };
}


export async function getClientByEmail(email: string) {
  return await prisma.formData.findUniqueOrThrow({
    where: {
      email: email,
    },
  });
}

export * from "./subdomains"
export * from "./admin"