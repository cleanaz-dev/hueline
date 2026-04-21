import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Check if a form data entry already exists with this email
    const existingForm = await prisma.subdomainUser.findUnique({
      where: { email },
      select: { id: true }, // We only need the ID to verify existence
    });

    // If existingForm is null, it means the email is available
    return NextResponse.json({ available: !existingForm });
  } catch (error) {
    console.error("Error checking email:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}