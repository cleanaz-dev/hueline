import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { MOCK_PROSPECTS } from "@/components/admin/prospects/mock-data";

interface Params {
  params: Promise<{
    id: string
  }>
}

export async function GET(req: Request, { params }: Params) {
  try {
    const { id } = await params;

    // ✅ 1. DEV MODE FIRST
    if (process.env.NODE_ENV === "development") {
      const mock = MOCK_PROSPECTS.find(p => p.id === id);

      if (mock) {
        return NextResponse.json(mock.communication);
      }
    }

    // ✅ 2. PROD / FALLBACK → DB
    const messages = await prisma.clientCommunication.findMany({
      where: {
        OR: [{ demoClientId: id }, { clientId: id }],
      },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json(messages);
  } catch (error) {
    return NextResponse.json([], { status: 500 });
  }
}