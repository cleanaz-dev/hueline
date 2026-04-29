
import { NextResponse } from "next/server";

export const revalidate = 60; // cache for 60 seconds

export async function GET() {
  try {
    const res = await fetch("https://api.cal.com/v2/bookings", {
      headers: {
        "Authorization": `Bearer ${process.env.CALCOM_API_KEY}`,
        "cal-api-version": "2024-08-13",
      },
      next: { revalidate: 60 }, // Next.js cache
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: `Cal.com API error: ${res.status}` },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json(data.data ?? []);
  } catch (err) {
    console.error("Failed to fetch cal.com bookings:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}