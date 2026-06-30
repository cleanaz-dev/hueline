import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { updateIntelligenceSettings } from "@/lib/prisma/mutations/intelligence/save-intelligence";

export const maxDuration = 60;

interface Params {
  params: Promise<{
    slug: string;
    intelligenceId: string;
  }>;
}

export async function PATCH(req: Request, { params }: Params) {
  const { intelligenceId, slug } = await params;

  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ message: "Invalid Session" }, { status: 401 });
  }

  // 1. Verify user
  const validUser = await prisma.subdomainUser.findUnique({
    where: { email: session.user.email },
  });

  if (!validUser) {
    return NextResponse.json({ message: "Unauthorized Request" }, { status: 401 });
  }

  // 2. SECURITY: Verify the slug actually owns this Intelligence record
  const subdomain = await prisma.subdomain.findUnique({
    where: { slug },
    select: { intelligenceId: true },
  });

  if (!subdomain || subdomain.intelligenceId !== intelligenceId) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  try {
    // 3. Get the payload
    const body = await req.json();

    // 4. Pass off to the dedicated mutation handler
    const intelligence = await updateIntelligenceSettings(intelligenceId, body);

    return NextResponse.json({ success: true, data: intelligence });
    
  } catch (error) {
    console.error("[INTELLIGENCE_PATCH_ERROR]:", error);
    return NextResponse.json({ message: "Server Error" }, { status: 500 });
  }
}