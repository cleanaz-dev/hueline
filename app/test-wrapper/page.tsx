import BookingWrapper from '@/components/booking/booking-wrapper'
import React from 'react'


export default function page() {
  // Create mock params like your wrapper expects
  const mockParams = Promise.resolve({
    bookingId: "1234567890" // put your actual booking ID here
  })

  return <BookingWrapper params={mockParams} />
}