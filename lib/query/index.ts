import { prisma } from "../prisma";
import { sendBookingNotification } from "../slack";

interface BookingData {
  name: string;
  phone: string;
  createdAt?: Date;
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

  // 🔥 Send Slack notification after creating new booking
  await sendBookingNotification({
    name: data.name,
    phone: data.phone,
  });

  return true; // New booking created
}

export async function getBookingData(): Promise<BookingData[]> {
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
