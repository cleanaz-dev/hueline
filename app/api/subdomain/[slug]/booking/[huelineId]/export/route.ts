// app/api/subdomain/[slug]/booking/[huelineId]/export/route.ts

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import { getPresignedUrl } from "@/lib/aws/s3";
import { prisma } from "@/lib/prisma";

interface Params {
  params: Promise<{
    huelineId: string;
    slug: string;
  }>;
}

export async function POST(req: Request, { params }: Params) {
  const { huelineId, slug } = await params;

  try {
    // 1. Auth check
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Get body
    const body = await req.json();
    const { imageKeys, resolution, phone } = body; // imageKeys = ["mockups/123/image1.jpg", ...]

    if (!imageKeys?.length || !resolution || !phone) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const subdomain = await prisma.subdomain.findUnique({
      where: {slug},
      select: {
        twilioPhoneNumber: true
      }
    })

    if(!subdomain) {
      return NextResponse.json(
       { error: "Invalid Data Requst" },
        { status: 400 }
      )
    }

    // 4. Call Lambda
    const lambdaResponse = await fetch(process.env.LAMBDA_EXPORT_URL!, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        slug,
        hueline_id: huelineId,
        image_keys: imageKeys,
        resolution,
        phone,
        twilio_from: subdomain.twilioPhoneNumber
      }),
    });
    if (!lambdaResponse.ok) {
      throw new Error("Lambda request failed");
    }

    const { job_id } = await lambdaResponse.json();

    return NextResponse.json({
      success: true,
      jobId: job_id,
      message: "Export started. You'll receive an SMS when ready.",
    });
  } catch (error) {
    console.error("Export error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
