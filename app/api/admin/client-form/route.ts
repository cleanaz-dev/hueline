import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { clientIntakeHandler } from "@/lib/handlers/client-intake-handler";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // 1. Destructure out specific fields
    const { 
      email, company, phone, features, hours, name, crm, country, city, state,
      subDomain, twilioNumber, transferNumber, voiceGender, voiceName, clientId,
      ...rest 
    } = body;

    console.log("📦 body", body);

    if (!email || !company || !phone || !name || !subDomain) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Clean up clientId so it's strictly a string OR undefined
    const parsedClientId = clientId ? String(clientId) : undefined;

    // 2. Upsert Subdomain FIRST. 
    const subdomain = await prisma.subdomain.upsert({
      where: { slug: subDomain },
      update: {
        companyName: company,
        twilioPhoneNumber: twilioNumber || null,
        forwardingNumber: transferNumber || null,
        clientId: parsedClientId, // Links to client if parsedClientId exists
      },
      create: {
        slug: subDomain,
        companyName: company,
        twilioPhoneNumber: twilioNumber || null,
        forwardingNumber: transferNumber || null,
        clientId: parsedClientId, // Links to client if parsedClientId exists
      },
    });

    // 3. Pack only the remaining UI/AI settings into config
    const config = {
      voiceGender,
      voiceName,
      ...rest,
    };

    // 4. Upsert FormData and officially link it to Subdomain AND Client
    const form = await prisma.formData.upsert({
      where: { email },
      update: { 
        company, phone, features, hours, name, crm, config,
        subdomainId: subdomain.id, 
        clientId: parsedClientId, // Links to client if parsedClientId exists
      },
      create: { 
        email, company, phone, features, hours, name, crm, config,
        subdomainId: subdomain.id, 
        clientId: parsedClientId, // Links to client if parsedClientId exists
      },
    });

    console.log("🔧 Linked Subdomain & Config saved");

    // 5. UPDATE CLIENT STATUS (If this was a paid Stripe client)
    if (parsedClientId) {
      await prisma.client.update({
        where: { id: parsedClientId },
        data: {
          status: "INTAKE_FORM_COMPLETE",
        },
      });
      console.log(`✅ Client ${parsedClientId} status updated to INTAKE_FORM_COMPLETE`);
    }

    // 6. Fire off the email handler
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