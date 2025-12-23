import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"; // Adjust path to your prisma client

export async function GET(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const { searchParams } = new URL(req.url);
  const subdomainId = searchParams.get("subdomainId");

  // 1. SECURITY: Verify the Lambda's API Key
  const apiKey = req.headers.get("x-api-key");
  if (apiKey !== process.env.INTERNAL_API_KEY) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // 2. FETCH INTELLIGENCE
    // We prefer searching by ID (faster/safer), but fallback to slug if needed
    const subdomain = await prisma.subdomain.findFirst({
      where: subdomainId ? { id: subdomainId } : { slug: slug },
      include: { intelligence: true },
    });

    if (!subdomain || !subdomain.intelligence) {
      // Return defaults if no config exists yet
      return NextResponse.json({
        prompt: "You are a standard estimator assistant.",
        values: {},
        schema: {} 
      });
    }

    // 3. RETURN THE CONFIG
    // This matches exactly what your Lambda expects
    return NextResponse.json({
      prompt: subdomain.intelligence.prompt,
      values: subdomain.intelligence.values || {},
      schema: subdomain.intelligence.schema || {},
    });

  } catch (error) {
    console.error("Config Fetch Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}