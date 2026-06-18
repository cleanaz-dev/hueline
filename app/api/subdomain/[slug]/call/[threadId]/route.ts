import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { headers } from "next/headers";

interface Params {
    params: Promise<{
        slug: string;
        threadId: string;
    }>
}

export async function POST(req: Request, { params }: Params) {
    const { slug, threadId } = await params;

    const headersList = await headers();
    const secret = headersList.get("x-webhook-secret");

    if (secret !== process.env.LAMBDA_WEBHOOK_SECRET) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await req.json();
        const { customerId, duration, domainId, triggerSource } = body;

        const subdomain = await prisma.subdomain.findUnique({
            where: { id: domainId },
        });

        if (!subdomain) {
            return NextResponse.json({ message: "Subdomain not found" }, { status: 404 });
        }

        const call = await prisma.outboundCall.create({
            data: {
                subdomain: { connect: { id: domainId } },
                thread: { connect: { id: threadId } },
                ...(customerId && { customer: { connect: { id: customerId } } }),
                callType: triggerSource,
            },
        });

        return NextResponse.json({ message: "Outbound call created", job_id: call.id }, { status: 201 });

    } catch (error) {
        console.error("Create outbound call error:", error);
        return NextResponse.json({ message: "Internal Server Error", error: String(error) }, { status: 500 });
    }
}