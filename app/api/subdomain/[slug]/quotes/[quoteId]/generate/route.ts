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

export async function POST({ params }: Params) {
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
      include: {
        booking: {
          select: {
            roomType: true,
            prompt: true,
            paintColors: true,
            dimensions: true,
          },
        },
      },
    });

    if (
      !quote ||
      !quote.booking?.paintColors ||
      !quote.booking ||
      !quote.booking.roomType ||
      !quote.booking.prompt
    ) {
      return NextResponse.json(
        { message: "Invalid quote data" },
        { status: 404 },
      );
    }

    const response = await generateQuote({
      roomType: quote.booking.roomType || undefined,
      prompt: quote.booking.prompt || undefined,
      colorNames: quote.booking.paintColors
        .map((color) => color.name)
        .join(", "),
    });

    console.log("Quote generation response:", response);

    const { items, totalAmount } = response;

    await prisma.quote.update({
      where: { id: quoteId },
      data: {
        items: items as any,
        totalAmount: totalAmount,
      },
    });
    return NextResponse.json({ message: "Quote generated successfully!" });
  } catch (error) {
    console.error("Error generating quote:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 },
    );
  }
}
