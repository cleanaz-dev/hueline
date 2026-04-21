import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { clientIntakeHandler } from "@/lib/handlers/client-intake-handler";
import { updateActivity } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // 1. Destructure out specific fields so we can route them properly
    const { 
      email, company, phone, features, hours, name, crm, 
      subDomain, twilioNumber, transferNumber, voiceGender, voiceName, 
      ...rest 
    } = body;

    console.log("📦 body", body);

    if (!email || !company || !phone || !name || !subDomain) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // 2. Upsert Subdomain FIRST. 
    // This creates it if it doesn't exist, or updates it if they resubmit.
    const subdomain = await prisma.subdomain.upsert({
      where: { slug: subDomain },
      update: {
        companyName: company,
        twilioPhoneNumber: twilioNumber || null,
        forwardingNumber: transferNumber || null,
      },
      create: {
        slug: subDomain,
        companyName: company,
        twilioPhoneNumber: twilioNumber || null,
        forwardingNumber: transferNumber || null,
      },
    });

    // 3. Pack only the remaining UI/AI settings into config
    const config = {
      voiceGender,
      voiceName,
      ...rest,
    };

    // 4. Upsert FormData and officially link it to the Subdomain via ID
    const form = await prisma.formData.upsert({
      where: { email },
      update: { 
        company, phone, features, hours, name, crm, config,
        subdomainId: subdomain.id // Establishing the 1-to-1 relationship
      },
      create: { 
        email, company, phone, features, hours, name, crm, config,
        subdomainId: subdomain.id // Establishing the 1-to-1 relationship
      },
    });

    console.log("🔧 Linked Subdomain & Config saved");

    // 5. Fire off the email handler with the full dataset
    await clientIntakeHandler({
      email,
      company,
      phone,
      features,
      hours,
      name,
      crm,
      config: {
        subDomain,
        twilioNumber,
        transferNumber,
        voiceGender,
        voiceName,
        ...rest,
      },
    });

    await updateActivity(email, "Completed Intake Form");

    return NextResponse.json({ success: true, data: form, subdomain });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("❌ Error saving form:", message);
    return NextResponse.json(
      { error: "Failed to save form", details: message },
      { status: 500 }
    );
  }
}