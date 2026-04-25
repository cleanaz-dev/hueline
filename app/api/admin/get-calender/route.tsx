import { NextResponse } from "next/server";

export async function GET() {
  const res = await fetch("https://api.cal.com/v1/bookings?apiKey=" + process.env.CALCOM_API_KEY);
  const data = await res.json();
  return NextResponse.json(data.bookings);
}