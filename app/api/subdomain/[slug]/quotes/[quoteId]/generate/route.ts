import { authOptions } from "@/lib/auth";
import { isOperatorValid } from "@/lib/auth/guard/is-operator-valid";
import { prisma } from "@/lib/prisma/config";
import { acquireResourceLock, releaseResourceLock } from "@/lib/redis";
import axios from "axios";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

interface Params {
  params: Promise<{
    slug: string;
    quoteId: string;
  }>;
}

export async function POST(req: Request, { params }: Params) {
  const { slug, quoteId } = await params;

  // Validate env config early
  const apiUrl = process.env.LAMBDA_QUOTE_GENERATION_URL;
  if (!apiUrl) {
    console.error("LAMBDA_QUOTE_GENERATION_URL is not set");
    return NextResponse.json(
      { message: "Service misconfigured" },
      { status: 500 },
    );
  }

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
    // Validate quote data before any further work
    const quote = await prisma.quote.findUnique({
      where: { id: quoteId },
      include: {
        customer: true,
        booking: {
          select: {
            roomType: true,
            prompt: true,
            paintColors: true,
            dimensions: true,
            subdomainId: true,
          },
        },
      },
    });

    if (
      !quote ||
      !quote.booking ||
      !quote.booking.paintColors ||
      !quote.booking.roomType ||
      !quote.booking.prompt ||
      !quote.customer
    ) {
      return NextResponse.json(
        { message: "Invalid quote data" },
        { status: 404 },
      );
    }

    // Resolve operator only after quote is confirmed valid
    const operator = await prisma.subdomainUser.findFirst({
      where: {
        email: userEmail,
        subdomain: { slug },
      },
      select: { id: true },
    });

    console.log("⏱️ Quote generation started...");

    const lockKey = await acquireResourceLock(quoteId, "QUOTE");

    if (!lockKey) {
      return NextResponse.json(
        { message: "Task already running for this project!" },
        { status: 429 },
      );
    }

    let systemTask;

    try {
      systemTask = await prisma.systemTask.create({
        data: {
          deliveryMethod: "NONE",
          initiator: "OPERATOR",
          type: "QUOTE_GENERATION",
          status: "PROCESSING",
          lockKey,
          customer: { connect: { id: quote.customer.id } },
          subdomain: { connect: { id: quote.booking.subdomainId } },
          ...(operator ? { operator: { connect: { id: operator.id } } } : {}),
          metadataSource: "QUOTE_GENERATION",
          metadata: {
            quoteId: quote.id,
            bookingPrompt: quote.booking.prompt,
            roomType: quote.booking.roomType,
            colorNames: quote.booking.paintColors.map((c) => c.name).join(", "),
            squareFeet: quote.booking.dimensions,
          },
        },
      });

      const lambdaPayload = systemTask.metadata as Record<string, unknown>;

      await axios.post(apiUrl, {
        systemTaskId: systemTask.id,
        ...lambdaPayload,
        action: "GENERATE_QUOTE",
      });
    } catch (innerError) {
      // Release the lock so retries aren't permanently blocked
      await releaseResourceLock(lockKey);
      throw innerError;
    }

    return NextResponse.json(
      { message: "Quote generation initiated" },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error generating quote:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 },
    );
  }
}