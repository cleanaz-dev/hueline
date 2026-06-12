// app/api/threads/[threadId]/hueclaw-status/route.ts
import { NextResponse } from "next/server";
import { getHueClawStatus } from "@/lib/redis";
import { prisma } from "@/lib/prisma";

interface Params {
  params: Promise<{
    slug: string;
    threadId: string;
  }>;
}

export async function GET(req: Request, { params }: Params) {
  const { slug, threadId } = await params;

  try {
    // Muted code for DB effieciecy, we know the thread exists because this GET is called from the thread
    // await prisma.chatThread.findFirstOrThrow({
    //   where: {
    //     id: threadId,
    //     subdomain: { slug },
    //   },
    // });

    const status = await getHueClawStatus(threadId);

    return NextResponse.json({
      isWorking: !!status,
      taskType: status, // Will be "COMMUNICATION", "IMAGEN", "QUOTE", or null
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Error Checking HueClaw Status" },
      { status: 500 },
    );
  }
}
