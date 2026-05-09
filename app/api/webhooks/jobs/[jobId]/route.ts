import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { handleImagenWebhook } from "@/lib/workflows/imagen/handle-imagen-webhook";

interface Params {
  params: Promise<{ jobId: string }>;
}

export async function POST(req: Request, { params }: Params) {
  const { jobId } = await params;

  try {
    // 1. Universal Security Check
    const authHeader = req.headers.get("x-webhook-secret");
    if (authHeader !== process.env.LAMBDA_WEBHOOK_SECRET) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // 2. Fetch the Job AND the associated DemoClient
    const job = await prisma.job.findUnique({
      where: { id: jobId },
      include: { demoClient: true }, // 🌟 Now this works perfectly!
    });

    if (!job) {
      return NextResponse.json({ message: "Job not found" }, { status: 404 });
    }

    // If there is no client attached, we can't text/email anyone!
    if (!job.demoClient) {
      return NextResponse.json({ message: "No client attached to this job" }, { status: 400 });
    }

    // 3. Parse the body once
    const body = await req.json();

    // 4. THE ROUTER: Send to the right workflow based on the Prisma Enum
    switch (job.jobType) { 
      case "IMAGEN":
        // Figure out trigger source
        const triggerSource = body.action === "followUp" ? "CRON_FOLLOWUP" : "OPERATOR_PORTAL";
        
        // Pass everything to the smart handler
        return await handleImagenWebhook(
          body, 
          triggerSource, 
          job, 
          job.demoClient // 🌟 TS loves this because it knows it's not null here!
        );

      case "UPSCALE":
        // return await handleUpscaleWebhook(body, job.demoClientId, job);
        return NextResponse.json({ message: "Upscale workflow pending" }, { status: 501 });

      case "VIDEO":
        // return await handleVideoWebhook(body, job.demoClientId, job);
        return NextResponse.json({ message: "Video workflow pending" }, { status: 501 });

      default:
        console.warn(`Unhandled job type: ${job.jobType} for Job: ${jobId}`);
        return NextResponse.json({ message: "Unhandled Job Type" }, { status: 400 });
    }

  } catch (error: any) {
    console.error(`Master Webhook Error for Job ${jobId}:`, error.message || error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}