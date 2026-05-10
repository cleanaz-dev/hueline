import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { handleImagenWebhook } from "@/lib/workflows/imagen/handle-imagen-webhook";
import { ImagenTriggerSource } from "@/lib/workflows/imagen/process-imagen-workflow";

interface Params {
  params: Promise<{ jobId: string }>;
}

const VALID_IMAGEN_ACTIONS = new Set<ImagenTriggerSource>([
  "FOLLOWUP_IMAGEN",
  "OPERATOR_IMAGEN",
  "CLIENT_IMAGEN",
]);

export async function POST(req: Request, { params }: Params) {
  const { jobId } = await params;

  try {
    const authHeader = req.headers.get("x-webhook-secret");
    if (authHeader !== process.env.LAMBDA_WEBHOOK_SECRET) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const job = await prisma.job.findUnique({
      where: { id: jobId },
      include: { demoClient: true },
    });

    if (!job) {
      return NextResponse.json({ message: "Job not found" }, { status: 404 });
    }

    if (!job.demoClient) {
      return NextResponse.json({ message: "No client attached to this job" }, { status: 400 });
    }

    const body = await req.json();

    switch (job.jobType) {
      case "IMAGEN": {
        const triggerSource = body.action as ImagenTriggerSource;

        if (!VALID_IMAGEN_ACTIONS.has(triggerSource)) {
          return NextResponse.json(
            { message: `Unknown action: "${body.action}". Expected: ${[...VALID_IMAGEN_ACTIONS].join(", ")}` },
            { status: 400 }
          );
        }

        return await handleImagenWebhook(body, triggerSource, job, job.demoClient);
      }

      case "UPSCALE":
        
        return NextResponse.json({ message: "Upscale workflow pending" }, { status: 501 });

      case "VIDEO":
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