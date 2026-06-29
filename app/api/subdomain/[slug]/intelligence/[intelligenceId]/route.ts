import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getIntelligenceExamples } from "@/lib/handlers/get-intelligence-examples";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

interface Params {
  params: Promise<{
    slug: string;
    intelligenceId: string;
  }>;
}

export async function PATCH(req: Request, { params }: Params) {
  const { intelligenceId } = await params;

  const session = await getServerSession(authOptions);
  const user = session?.user;

  if (!session || !user)
    return NextResponse.json({ message: "Invalid Session" }, { status: 401 });

  const validUser = await prisma.subdomainUser.findUnique({
    where: { email: user.email! },
  });

  if (!validUser)
    return NextResponse.json({ message: "Unauthorized Request" }, { status: 401 });

  try {
    const { prompt, priceBook, contextFlags } = await req.json();

    const { examples, roomExamples } = await getIntelligenceExamples({ priceBook, contextFlags });

    const intelligence = await prisma.intelligence.update({
      where: { id: intelligenceId },
      data: { prompt, priceBook, contextFlags, examples, roomExamples },
    });

    return NextResponse.json({ success: true, data: intelligence });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Server Error" }, { status: 500 });
  }
}