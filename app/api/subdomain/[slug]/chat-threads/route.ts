import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

interface Params {
  params: Promise<{
    slug: string;
  }>;
}

export async function GET(req: Request, { params }: Params) {
  const session = await getServerSession(authOptions);
  const user = session?.user;
  const { slug } = await params;

  if (!user?.email) {
    return NextResponse.json({ message: "Not Authorized" }, { status: 400 });
  }
  if (!slug) {
    return NextResponse.json({ message: "Invalid Request" }, { status: 401 });
  }

  try {
    const chatThreads = await prisma.chatThread.findMany({
      where: {
        // SECURITY: Only fetch threads that belong to this subdomain
        customer: {
          subdomain: {
            slug: slug,
          },
        },
      },

      include: {
        // UI REQUIREMENT: The widget needs the customer's name, phone, and email to display the list
        customer: {
          select: {
            id: true,
            name: true,
            phone: true,
            email: true,
          }
        },
      },
      orderBy: {
        // UX: Show the most recent chats at the top of the list
        updatedAt: "desc",
      },
      take: 20, // Optional: Limit to recent 20 threads for performance
    });

    console.log("Threads:", chatThreads)

    // Return inside a "threads" object so it matches SWR expecting { threads: [] }
    return NextResponse.json({ threads: chatThreads });
  } catch (error) {
    console.error("Error fetching chat threads:", error);
    return NextResponse.json(
      { message: "Could Not Fetch Data" },
      { status: 500 },
    );
  }
}