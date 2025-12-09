import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface Params {
  params: Promise<{
    slug: string
  }>
}

export async function GET(req: Request, { params }: Params) {
  try {
    // 1. Await the params (Next.js 15 Requirement)
    const { slug } = await params;

    // 2. Fetch Subdomain + Team Members
    // We strictly select user fields to avoid leaking passwordHash
    const subdomain = await prisma.subdomain.findUnique({
      where: { slug },
      include: {
        users: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            // Add 'image' here if you add it to your schema later
          },
          orderBy: {
            createdAt: 'asc' // Owners usually created first
          }
        }
      }
    });

    // 3. Handle 404
    if (!subdomain) {
      return new NextResponse("Subdomain not found", { status: 404 });
    }

    // 4. Return Data
    // The structure matches your SubdomainAccountData interface
    return NextResponse.json(subdomain);

  } catch (error) {
    console.error("[ACCOUNT_GET_ERROR]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}