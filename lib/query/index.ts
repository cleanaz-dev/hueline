//lib/query/index.ts

import { prisma } from "../prisma";

interface BookingData {
  name: string;
  phone: string;
  createdAt?: Date
}


export async function getClientByEmail(email: string) {
  return await prisma.formData.findUniqueOrThrow({
    where: {
      email: email  // or using ES6 shorthand: { email }
    }
  });
}

export async function saveBookingData(data: BookingData): Promise<void> {
  if (!data?.phone) return;               // null-guard only

  const bookingExist = await prisma.bookingData.findFirst({
    where: { phone: data.phone },
  });
  if (bookingExist) return;

  await prisma.bookingData.create({
    data: { name: data.name, phone: data.phone },
  });
}

export async function getBookingData(): Promise<BookingData[]> {
  return await prisma.bookingData.findMany({
    orderBy: {
      createdAt: 'desc'
    }
  })
}