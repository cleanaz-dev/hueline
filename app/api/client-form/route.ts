// api/client-form

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { clientIntakeHandler } from "@/lib/handlers/client-intake-handler";
import { updateActivity } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { email, company, phone, features, hours, name, crm, ...rest } = body;

    console.log("📦 body", body);

    if (!email || !company || !phone || !name) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const config = Object.keys(rest).length > 0 ? rest : undefined;

    const form = await prisma.formData.upsert({
      where: { email },
      update: { company, phone, features, hours, name, crm, config },
      create: { email, company, phone, features, hours, name, crm, config },
    });

    console.log("🔧 config:", config);

    await clientIntakeHandler({
      email,
      company,
      phone,
      features,
      hours,
      name,
      crm,
      config,
    });

    await updateActivity(email, "Completed Intake Form");

    return NextResponse.json({ success: true, data: form });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("❌ Error saving form:", message);
    return NextResponse.json(
      { error: "Failed to save form", details: message },
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
      include: {
        activities: true,
        subdomain: {
          select: {
            logo: true,
            splashScreen: true,
          },
        },
      },
    });

    if (!form) {
      return NextResponse.json({ error: "Form not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: form });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("❌ Error fetching form data:", message);
    return NextResponse.json(
      { error: "Failed to fetch form data", details: message },
      { status: 500 }
    );
  }
}