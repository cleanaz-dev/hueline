import { NextResponse } from "next/server";

export async function GET() {
  const res = await fetch("https://api.cal.com/v2/bookings", {
    headers: {
      "Authorization": `Bearer ${process.env.CALCOM_API_KEY}`,
      "cal-api-version": "2024-08-13",
    },
  });
  const data = await res.json();
  return NextResponse.json(data.data);
}