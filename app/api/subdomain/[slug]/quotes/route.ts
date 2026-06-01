import { authOptions } from "@/lib/auth";
import { isOperatorValid } from "@/lib/auth/guard/is-operator-valid";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface Params {
  params: Promise<{
    slug: string;
  }>;
}

export async function GET(req: Request, { params }: Params) {
  const { slug } = await params;
  const session = await getServerSession(authOptions);
  const userEmail = session?.user?.email;

  if (!session || !userEmail) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const operatorAccess = await isOperatorValid(userEmail, slug);

  if (!operatorAccess) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const quotes = await prisma.quote.findMany({
      where: {
        subdomain: { slug }
      }
    });

    return NextResponse.json(quotes);
  } catch (error) {
    console.error("Error fetching quotes:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}