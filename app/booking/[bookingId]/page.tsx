import BookingWrapper from "@/components/booking/booking-wrapper";
import React from "react";
import { getBooking } from "@/lib/redis";
import { saveBookingData } from "@/lib/query";

type Props = {
  params: Promise<{
    bookingId: string;
  }>;
};

export default async function page({ params }: Props) {
  const { bookingId } = await params;
  const booking = await getBooking(bookingId);
  await saveBookingData(booking)
  // console.log("Booking Data:", booking)

  return <BookingWrapper booking={booking} />
}
