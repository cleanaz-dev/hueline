import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { clientIntakeHandler } from "@/lib/handlers/client-intake-handler";
import { updateActivity } from "@/lib/query";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { email, company, phone, features, hours, name, ...rest } = body;

    console.log("body", body);

    if (!email || !company || !phone || !name) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Put all extra fields into config
    const config = Object.keys(rest).length > 0 ? rest : undefined;

    const form = await prisma.formData.upsert({
      where: { email },
      update: { company, phone, features, hours, name, config },
      create: { email, company, phone, features, hours, name, config },
    });

    console.log("config:", config);

    // return NextResponse.json({ message: "OK!" }, { status: 200 });

    // Pass the structured data with config to the handler
    await clientIntakeHandler({
      email,
      company,
      phone,
      features,
      hours,
      name,
      config,
    });

    await updateActivity(email, "Completed Intake Form");

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
      include: {
        activities: true,
      },
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
