import BookingWrapper from "@/components/booking/booking-wrapper";
import React from "react";
import { getBooking } from "@/lib/redis";
import { saveBookingData } from "@/lib/query";
import { sendBookingNotification } from "@/lib/slack";
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
  
  const booking = await getBooking(bookingId);
  
  if (!booking) {
    notFound();
  }
  
  const session = await getServerSession(authOptions);
  const isAuthorized = session?.user?.id === bookingId;

  if (!isAuthorized) {
    redirect(`/booking/login?bookingId=${bookingId}`);
  }

  // Save to database and check if it's a new booking
  const isNewBooking = await saveBookingData(booking);
  
  // 🔥 Only send Slack notification for NEW bookings
  if (isNewBooking) {
    await sendBookingNotification({
      bookingId,
      name: booking.name,
      phone: booking.phone,
      prompt: booking.prompt,
      mockup_urls: booking.mockup_urls,
      paint_colors: booking.paint_colors,
    });
  }
  
  return <BookingWrapper booking={booking} />;
}