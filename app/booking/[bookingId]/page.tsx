import BookingWrapper from "@/components/booking/booking-wrapper";
import React from "react";
import { getBooking } from "@/lib/redis";
import { saveBookingData } from "@/lib/query";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth"; // Use your existing admin auth
import { redirect } from "next/navigation";

type Props = {
  params: Promise<{
    bookingId: string;
  }>;
};

export default async function page({ params }: Props) {
  const { bookingId } = await params;
  
  const session = await getServerSession(authOptions);
  
  // Simple check - if session exists and user id matches bookingId
  // @ts-ignore
  const isAuthorized = session?.user?.id === bookingId;

  if (!isAuthorized) {
    redirect(`/booking/login?bookingId=${bookingId}`);
  }

  const booking = await getBooking(bookingId);
  await saveBookingData(booking);

  return <BookingWrapper booking={booking} />
}