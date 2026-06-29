import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getIntelligenceExamples } from "@/lib/handlers/get-intelligence-examples";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

// IMPORTANT: AI generation can easily take 10-20 seconds. 
// If you host on Vercel, this prevents the default 15s timeout from killing the request.
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
  const user = session?.user;

  if (!session || !user?.email) {
    return NextResponse.json({ message: "Invalid Session" }, { status: 401 });
  }

  // 1. Verify user
  const validUser = await prisma.subdomainUser.findUnique({
    where: { email: user.email },
  });

  if (!validUser) {
    return NextResponse.json({ message: "Unauthorized Request" }, { status: 401 });
  }

  // 2. SECURITY: Verify the slug actually owns this Intelligence record
  const subdomain = await prisma.subdomain.findUnique({
    where: { slug },
    select: { intelligenceId: true } 
  });

  if (!subdomain || subdomain.intelligenceId !== intelligenceId) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  try {
    // 3. STABILITY: Provide defensive defaults to empty arrays in case the frontend sends undefined
    const { prompt = "", priceBook = [], contextFlags = [] } = await req.json();

    // 4. Generate AI examples based on the newly saved rules
    const { examples, roomExamples } = await getIntelligenceExamples({
      priceBook,
      contextFlags,
    });

    // 5. Commit everything to the database
    const intelligence = await prisma.intelligence.update({
      where: { id: intelligenceId },
      data: { prompt, priceBook, contextFlags, examples, roomExamples },
    });

    return NextResponse.json({ success: true, data: intelligence });
    
  } catch (error) {
    // Better error logging prefix so you can spot AI failures easily in the terminal
    console.error("[INTELLIGENCE_PATCH_ERROR]:", error);
    return NextResponse.json({ message: "Server Error" }, { status: 500 });
  }
}