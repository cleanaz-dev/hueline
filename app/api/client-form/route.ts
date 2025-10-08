import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { clientIntakeHandler } from "@/lib/handlers/client-intake-handler";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { email, company, phone, features, hours, name } = body;

    if (!email || !company || !phone || !name) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const form = await prisma.formData.upsert({
      where: { email },
      update: { company, phone, features, hours, name },
      create: { email, company, phone, features, hours, name },
    });

    await clientIntakeHandler(body);

    return NextResponse.json({ success: true, data: form });
  } catch (err) {
    console.error("❌ Error saving form:", err);
    return NextResponse.json(
      { error: "Failed to save form", err },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const email = searchParams.get("email");

  if (!email) {
    return NextResponse.json({ error: "Missing email" }, { status: 400 });
  }

  try {
    const form = await prisma.formData.findUnique({
      where: { email },
    });

    if (!form) {
      return NextResponse.json({ error: "Form not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: form });
  } catch (err) {
    console.error("❌ Error fetching form data:", err);
    return NextResponse.json(
      { error: "Failed to fetch form data", err },
      { status: 500 }
    );
  }
}
