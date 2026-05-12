import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { handleImagenWebhook } from "@/lib/workflows/imagen/handle-imagen-webhook";
import { ImagenTriggerSource } from "@/lib/workflows/imagen/process-imagen-workflow";
import { UpscaleTriggerSource } from "@/lib/workflows/upscale/process-upscale-workflow";
import { handleUpscaleWebhook } from "@/lib/workflows/upscale/handle-upscale-webook";
import { handleVoiceMockupWebhook } from "@/lib/workflows/voice-mockup/handle-voice-mockup-webhook";
import { callTriggerSource } from "@/lib/workflows/call/process-call-workflow";
import { handleCallWebhook } from "@/lib/workflows/call/handle-call-webhook";

interface Params {
  params: Promise<{ jobId: string }>;
}

const VALID_IMAGEN_ACTIONS = new Set<ImagenTriggerSource>([
  "FOLLOWUP_IMAGEN",
  "OPERATOR_IMAGEN",
  "CLIENT_IMAGEN",
]);

const VALID_UPSCALE_ACTIONS = new Set<UpscaleTriggerSource>([
  "CLIENT_UPSCALE",
  "OPERATOR_UPSCALE",
]);

const VALID_CALL_ACTIONS = new Set<callTriggerSource>([
  "CALL_INTELLIGENCE",
  "REPEAT_CALL_INTELLIGENCE"
])

export async function POST(req: Request, { params }: Params) {
  const { jobId } = await params;

  try {
    const authHeader = req.headers.get("x-webhook-secret");
    if (authHeader !== process.env.LAMBDA_WEBHOOK_SECRET) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const job = await prisma.job.findUnique({
      where: { id: jobId },
      include: { customer: true },
    });

    if (!job) {
      return NextResponse.json({ message: "Job not found" }, { status: 404 });
    }

    if (!job.customer) {
      return NextResponse.json(
        { message: "No customer attached to this job" },
        { status: 400 },
      );
    }

    const body = await req.json();

    switch (job.jobType) {
      case "IMAGEN": {
        const triggerSource = body.action as ImagenTriggerSource;

        if (!VALID_IMAGEN_ACTIONS.has(triggerSource)) {
          return NextResponse.json(
            {
              message: `Unknown action: "${body.action}". Expected: ${[...VALID_IMAGEN_ACTIONS].join(", ")}`,
            },
            { status: 400 },
          );
        }

        return await handleImagenWebhook(
          body,
          triggerSource,
          job,
          job.customer,
        );
      }

      case "UPSCALE": { // <-- Added brackets here to safely scope variables
        // If Python sent {"status": "failed"}, we default triggerSource to CLIENT_UPSCALE 
        // just to get it through the router, then handle the failure inside the handler.
        const triggerSource = (body.action || "CLIENT_UPSCALE") as UpscaleTriggerSource;

        if (!VALID_UPSCALE_ACTIONS.has(triggerSource)) {
          return NextResponse.json(
            {
              message: `Unknown action: "${body.action}". Expected: ${[...VALID_UPSCALE_ACTIONS].join(", ")}`,
            },
            { status: 400 },
          );
        }

        // Return the handler response directly back to the Webhook sender
        return await handleUpscaleWebhook(
          body,
          job,
          job.customer,
          triggerSource
        );
      }

      case "VIDEO":
        return NextResponse.json(
          { message: "Video workflow pending" },
          { status: 501 },
        );


      case "VOICE": {
        const triggerSource = (body.action || "CALL_INTELLIGENCE") as callTriggerSource

        if (!VALID_CALL_ACTIONS.has(triggerSource)) {
           return NextResponse.json(
            {
              message: `Unknown action: "${body.action}". Expected: ${[...VALID_CALL_ACTIONS].join(", ")}`,
            },
            { status: 400 },
          );
        }

        return await handleCallWebhook(
          body,
          job,
          job.customer,
          triggerSource
        )
        return NextResponse.json(
          { message: "Video workflow pending" },
          { status: 501 },
        );
      }
      case "VOICE_MOCKUP": {
      const triggerSource = body.action || "LIVEKIT_AGENT";
        
        return await handleVoiceMockupWebhook(
          body,
          job,
          job.customer, // <-- Using the newly renamed Customer model!
          triggerSource
        );
      }
        

      default:
        console.warn(`Unhandled job type: ${job.jobType} for Job: ${jobId}`);
        return NextResponse.json(
          { message: "Unhandled Job Type" },
          { status: 400 },
        );
    }
  } catch (error: any) {
    console.error(
      `Master Webhook Error for Job ${jobId}:`,
      error.message || error,
    );
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 },
    );
  }
}