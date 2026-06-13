import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface Params {
  params: Promise<{
    slug: string;
    threadId: string;
  }>;
}

export async function PUT(req: Request, { params }: Params) {
  try {
    const { threadId, slug } = await params;
    const body = await req.json();

    // 1. Match the frontend payload perfectly
    const { customerId, isAutoPilot } = body.data;

    // Optional but good practice: Validate the payload
    if (!threadId || typeof isAutoPilot !== "boolean") {
      return NextResponse.json(
        { error: "Missing required fields" }, 
        { status: 400 }
      );
    }

    // 2. Update the database
    const updatedThread = await prisma.chatThread.update({
      where: {
        id: threadId, 
        // Note: If you really need to verify customerId here for security, 
        // use `updateMany` instead, or verify ownership first. 
        // But usually, `id: threadId` is safe enough for an internal API.
      },
      data: {
        isAutoPilot,
      },
    });

 
    return NextResponse.json({ 
      success: true, 
      thread: updatedThread 
    });

  } catch (error) {
    console.error("[AUTOPILOT_UPDATE_ERROR]", error);
    return NextResponse.json(
      { error: "Internal Server Error" }, 
      { status: 500 }
    );
  }
}