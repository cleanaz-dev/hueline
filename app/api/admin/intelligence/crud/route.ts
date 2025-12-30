import { verifyApiSuperAdmin } from "@/lib/auth";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { updateIntelligencePrompt } from "@/lib/assembly-ai/update-intelligence-prompt"; // <--- IMPORT THIS

export async function POST(req: Request) {
  const authCheck = await verifyApiSuperAdmin();
  if (authCheck instanceof NextResponse) return authCheck;

  try {
    const body = await req.json();
    const { action, slug, key, value, type, metaType } = body;

    if (!slug || !action) return new NextResponse("Missing data", { status: 400 });

    const subdomain = await prisma.subdomain.findUnique({
      where: { slug },
      include: { intelligence: true },
    });

    if (!subdomain) return new NextResponse("Subdomain not found", { status: 404 });

    // Handle Create if Missing
    let currentIntel = subdomain.intelligence;
    if (!currentIntel) {
      currentIntel = await prisma.intelligence.create({
        data: { values: {}, schema: {}, prompt: "", subdomain: { connect: { id: subdomain.id } } }
      });
    }

    // Mutable copies
    const valuesObj = (currentIntel.values as Record<string, any>) || {};
    const schemaObj = (currentIntel.schema as Record<string, any>) || {};
    let promptStr = currentIntel.prompt || "";

    switch (action) {
      case "ADD_ITEM":
        if (!key) return new NextResponse("Key required", { status: 400 });
        if (type === 'number') {
          valuesObj[key] = {
            value: Number(value) || 0,
            type: metaType || 'FEE',
            label: key.replace(/_/g, ' ')
          };
        } else {
          schemaObj[key] = 'boolean';
        }
        break;

      case "DELETE_ITEM":
        if (type === 'number') delete valuesObj[key];
        else delete schemaObj[key];
        break;

      case "UPDATE_FULL":
        if (value.values) {
           for (const k in valuesObj) delete valuesObj[k];
           Object.assign(valuesObj, value.values);
        }
        if (value.schema) {
           for (const k in schemaObj) delete schemaObj[k];
           Object.assign(schemaObj, value.schema);
        }
        
        // --- USE THE NEW UTILITY ---
        const userPromptInput = value.prompt || promptStr;
        promptStr = updateIntelligencePrompt(userPromptInput, valuesObj, schemaObj);
        // ---------------------------
        break;
    }

    const updated = await prisma.intelligence.update({
      where: { id: currentIntel.id },
      data: { values: valuesObj, schema: schemaObj, prompt: promptStr },
    });

    return NextResponse.json({ success: true, data: updated });

  } catch (error) {
    console.error(error);
    return new NextResponse("Server Error", { status: 500 });
  }
}