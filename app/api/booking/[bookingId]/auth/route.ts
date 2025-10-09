// app/api/booking/[bookingId]/auth/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getBooking } from '@/lib/redis';

export async function POST(
  request: NextRequest,
  { params }: { params: { bookingId: string } }
) {
  try {
    const { pin } = await request.json();
    const bookingId = params.bookingId;
    console.log("🔐 Login Attempt")
    const booking = await getBooking(bookingId);
    
    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    if (booking.pin !== pin) {
      return NextResponse.json({ error: 'Invalid PIN' }, { status: 401 });
    }

    return NextResponse.json({ success: true, bookingId });
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}