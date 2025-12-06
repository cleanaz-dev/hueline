// api/client-form/[subdomainId]/update/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { updateActivity } from "@/lib/prisma/queries";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { email, company, phone, features, hours, name, crm, ...rest } = body;

    if (!email || !company || !phone || !name) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Put all extra fields into config (same as your first route)
    const config = Object.keys(rest).length > 0 ? rest : undefined;

    const form = await prisma.formData.upsert({
      where: { email },
      update: { company, phone, features, hours, crm, name, config },
      create: { email, company, phone, features, crm, hours, name, config },
    });

    await updateActivity(email, "Updated Client Form")

    return NextResponse.json({ success: true, data: form });
  } catch (err) {
    console.error("❌ Error saving form:", err);
    return NextResponse.json(
      { error: "Failed to save form", err },
      { status: 500 }
    );
  }
}