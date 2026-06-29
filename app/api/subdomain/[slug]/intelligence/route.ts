import { authOptions } from "@/lib/auth";
import { getIntelligenceExamples } from "@/lib/handlers/get-intelligence-examples";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

interface Params {
  params: Promise<{
    slug: string;
  }>;
}

export async function GET(req: Request, { params }: Params) {
  const { slug } = await params;

  const session = await getServerSession(authOptions);
  const user = session?.user;

  if (!session || !user)
    return NextResponse.json({ message: "Invalid Session" }, { status: 401 });

  try {
    const validUser = await prisma.subdomainUser.findUnique({
      where: {
        email: user.email!,
      },
    });

    if (!validUser)
      return NextResponse.json(
        { message: "Unauthorized Request" },
        { status: 401 },
      );

    const result = await prisma.subdomain.findUnique({
      where: { slug },
      select: {
        intelligence: true,
      },
    });

    if (!result?.intelligence)
      return NextResponse.json({ message: "Data Not Found" }, { status: 404 });

    return NextResponse.json({ intelligence: result.intelligence });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Server Error" }, { status: 500 });
  }
}

