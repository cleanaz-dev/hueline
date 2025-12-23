import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyApiSuperAdmin } from "@/lib/auth";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const slug = searchParams.get("slug");
  await verifyApiSuperAdmin()


  if (!slug) {
    return NextResponse.json({ error: "Subdomain ID required" }, { status: 400 });
  }

  try {
    const subdomain = await prisma.subdomain.findUnique({
      where: { slug },
      include: { intelligence: true },
    });

    if (!subdomain || !subdomain.intelligence) {
      return NextResponse.json({ 
        hasConfig: false,
        prompt: null, 
        values: null, 
        schema: null 
      });
    }

    // console.log("intelligence:", subdomain.intelligence)

    return NextResponse.json({
      hasConfig: true,
      prompt: subdomain.intelligence.prompt,
      values: subdomain.intelligence.values,
      schema: subdomain.intelligence.schema,
    });

  } catch (error) {
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const { searchParams } = new URL(req.url);
  const slug = searchParams.get("slug");
  await verifyApiSuperAdmin()

  if (!slug) {
    return NextResponse.json({ error: "Subdomain ID required" }, { status: 400 });
  }

  try {
    const body = await req.json();
    const { prompt, values, schema } = body;

    const subdomain = await prisma.subdomain.findUnique({
      where: { slug },
      select: { 
        intelligenceId: true,
        id: true 
      }
    });

    if (!subdomain) {
      return NextResponse.json({ error: "Subdomain not found" }, { status: 404 });
    }

    let intelligence;

    if (subdomain.intelligenceId) {
      intelligence = await prisma.intelligence.update({
        where: { id: subdomain.intelligenceId },
        data: { prompt, values, schema },
      });
    } else {
      intelligence = await prisma.intelligence.create({
        data: {
          prompt,
          values,
          schema,
          subdomain: { connect: { id: subdomain.id } }
        },
      });
    }

    return NextResponse.json({ 
      success: true, 
      intelligence 
    });
  } catch (error) {
    console.error("Intelligence config save error:", error);
    return NextResponse.json(
      { error: "Internal Error" }, 
      { status: 500 }
    );
  }
}