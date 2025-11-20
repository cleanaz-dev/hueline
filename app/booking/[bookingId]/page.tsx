import BookingWrapper from "@/components/booking/booking-wrapper";
import React from "react";
import { getBooking } from "@/lib/redis";
import { saveBookingData } from "@/lib/query";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";

type Props = {
  params: Promise<{
    bookingId: string;
  }>;
};

export default async function page({ params }: Props) {
  const { bookingId } = await params;

  console.log("bookingID:", bookingId)
  
  const booking = await getBooking(bookingId);
  
  if (!booking) {
    notFound();
  }
  
  const session = await getServerSession(authOptions);
  const isAuthorized = session?.user?.id === bookingId;

  if (!isAuthorized) {
    redirect(`/booking/login?bookingId=${bookingId}`);
  }
  console.log('✅ User Auth')

  await saveBookingData({
    ...booking,
    sessionId: session.user.id // bookingId is the sessionId
  });
  
  return <BookingWrapper booking={booking} />;
}