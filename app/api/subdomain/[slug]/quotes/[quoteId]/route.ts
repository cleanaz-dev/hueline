import { authOptions } from "@/lib/auth";
import { isOperatorValid } from "@/lib/auth/guard/is-operator-valid";
import { generateQuote } from "@/lib/novita";
import { prisma } from "@/lib/prisma/config";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

interface Params {
  params: Promise<{
    slug: string;
    quoteId: string;
  }>;
}

export async function GET(req: Request, { params }: Params) {
  const { slug, quoteId } = await params;

  const session = await getServerSession(authOptions);
  const userEmail = session?.user?.email;

  if (!session || !userEmail) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const operatorAccess = await isOperatorValid(userEmail, slug);

  if (!operatorAccess) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  try {
    const quote = await prisma.quote.findUnique({
      where: { id: quoteId },
    });

    if (!quote) {
      return NextResponse.json({ message: "Quote not found" }, { status: 404 });
    }

    // console.log("Fetched quote:", quote);

    return NextResponse.json(quote);
  } catch (error) {
    console.error("Error fetching quote:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 },
    );
  }
}