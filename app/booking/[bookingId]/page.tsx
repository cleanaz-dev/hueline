import BookingWrapper from "@/components/booking/booking-wrapper";
import React from "react";
import { getBooking } from "@/lib/redis";

type Props = {
  params: Promise<{
    bookingId: string;
  }>;
};

export default async function page({ params }: Props) {
  const { bookingId } = await params;
  const booking = await getBooking(bookingId);
  console.log("Booking Data:", booking)

  return <BookingWrapper booking={booking} />
}
