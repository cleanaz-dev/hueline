import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

import { SystemTask, Customer } from "@/app/generated/prisma";
import { processUpscaleWorkflow, UpscaleTriggerSource } from "./process-upscale-workflow";

// 1. Zod Schema: This handles BOTH the "complete" and "failed" payloads from Python
const upscaleWebhookSchema = z.object({
  status: z.enum(["complete", "failed"]),
  s3Key: z.string().optional(),
  completedAt: z.string().optional(),
  action: z.enum(["CLIENT_UPSCALE", "OPERATOR_UPSCALE"]).optional(),
  size: z.number().optional(),
  operatorId: z.string().optional(),
  operatorName: z.string().optional(),
});

export async function handleUpscaleWebhook(
  body: any,
  job: SystemTask,
  customer: Customer,
  triggerSource: UpscaleTriggerSource,
) {
  try {
    // 2. Strict Zod Validation
    const parsedBody = upscaleWebhookSchema.safeParse(body);
    if (!parsedBody.success) {
      console.error("Invalid Webhook Payload:", parsedBody.error.issues);
      return NextResponse.json({ message: "Invalid webhook payload format" }, { status: 400 });
    }
    const validPayload = parsedBody.data;

    // 3. Handle Python Lambda Failures Gracefully
    if (validPayload.status === "failed") {
      await prisma.systemTask.update({ where: { id: job.id }, data: { status: "FAILED" } });
      return NextResponse.json({ message: "Job marked as failed" }, { status: 200 });
    }

    // 4. Validation for Successful Jobs
    if (!validPayload.s3Key) {
      return NextResponse.json({ message: "Missing s3Key in successful payload" }, { status: 400 });
    }
    if (!job.huelineId) { // Check the DB job, not the webhook body!
      return NextResponse.json({ message: "Job is missing huelineId" }, { status: 400 });
    }
    if (!customer.phone) {
      return NextResponse.json({ message: "No contact method found for client" }, { status: 400 });
    }

    // 5. Mark Job as Success
    await prisma.systemTask.update({ where: { id: job.id }, data: { status: "COMPLETED" } });

    // 6. Pass the strictly typed payload to the Processor
    await processUpscaleWorkflow({
      // We pass it in safely knowing s3Key and completedAt are definitely there now
      webhookBody: {
        status: validPayload.status,
        s3Key: validPayload.s3Key,
        completedAt: validPayload.completedAt || new Date().toISOString(),
        action: triggerSource,
        size: validPayload.size,
      }, 
      triggerSource,
      job,
      customer,
      operatorId: validPayload.operatorId || null,
      operatorName: validPayload.operatorName || null,
    });

    return NextResponse.json({ message: "Upscale processed and saved successfully" }, { status: 200 });

  } catch (error: any) {
    console.error(`Upscale Webhook Handler Error for ${customer.id}:`, error.message || error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}