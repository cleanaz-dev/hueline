import React from 'react'
import { getBooking } from "@/lib/redis"
import BookingPage from '@/components/booking/booking-id-page'

type Props = {
  params: Promise<{
    bookingId: string
  }>
}

export default async function page({ params }: Props) {
  const { bookingId } = await params
  const booking = await getBooking(bookingId)
  
  if (!booking) {
    return <div>Booking not found: {bookingId}</div>
  }

  return (
    <BookingPage booking={booking} />
  )
}