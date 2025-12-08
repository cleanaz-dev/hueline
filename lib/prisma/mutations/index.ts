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

export async function saveBookingData(data: BookingData): Promise<boolean> {
  if (!data?.phone) return false;

  const bookingExist = await prisma.bookingData.findFirst({
    where: { phone: data.phone },
  });

  if (bookingExist) return false; // Already exists, don't notify

  await prisma.bookingData.create({
    data: { name: data.name, phone: data.phone },
  });

  // 🔥 Schedule SMS notification (24h delay)
  await sendSmsNotification({
    name: data.name,
    phone: data.phone,
    sessionId: data.sessionId
  });

  // 🔥 Send Slack notification after creating new booking
  await sendBookingNotification({
    name: data.name,
    phone: data.phone,
  });

  return true; // New booking created
}

export async function getBookingData() {
  return await prisma.bookingData.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function updateActivity(email: string, action: string) {
  if (!action) return;
  await prisma.formActivity.create({
    data: {
      form: { connect: { email } },
      action: action,
    },
  });
}


export * from "./subdomains"