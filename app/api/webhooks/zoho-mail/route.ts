import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("Zoho Mail Webhook:", body);
    return NextResponse.json({ message: "Success" }, { status: 200 });
  } catch (error) {
    console.warn("Webhook Error:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 },
    );
  }
}
