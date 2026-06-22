import { authOptions } from "@/lib/auth";
import { cancelPendingFollowUp } from "@/lib/aws/event-scheduler/cancel-followups";
import { prisma } from "@/lib/prisma";
import { invalidateThreadCache } from "@/lib/redis/agent-context";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

interface Params {
  params: Promise<{
    slug: string;
    customerId: string;
    threadId: string;
  }>;
}

export async function POST(req: Request, { params }: Params) {
  const { customerId, slug, threadId } = await params;

  const session = await getServerSession(authOptions);
  const user = session?.user;

if (!session || !session.user)
  return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const validatedUser = await prisma.subdomainUser.findFirst({
    where: {
      email: user?.email!,
      subdomain: {
        slug
      }
    },
  });

  if (!validatedUser)
    return NextResponse.json(
      { message: "Unauthorized Request" },
      { status: 401 },
    );

  const followUp = await prisma.followUpSchedule.findFirst({
    where: {
      customerId,
      chatThreadId: threadId,
    },
  });
  if (!followUp)
    return NextResponse.json({ message: "Missing Data" }, { status: 400 });

  try {
    await cancelPendingFollowUp(threadId);
    await invalidateThreadCache(slug, threadId);

    return NextResponse.json(
      { message: "Cancelled FollowUp Successfully" },
      { status: 200 },
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Unable To Cancel FollowUp" },
      { status: 500 },
    );
  }
}
