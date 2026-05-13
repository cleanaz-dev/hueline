import { Customer, Job } from "@/app/generated/prisma";
import {
  processCallWorkflow,
} from "./process-call-workflow";
import { callWebhookBodySchema } from "@/lib/zod/call-webhook-body-schema";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { CallTriggerSource } from "@/lib/zod/job-voice-metadata";

export async function handleCallWebhook(
  body: any,
  job: Job,
  customer: Customer,

) {
  try {
    const parsedBody = callWebhookBodySchema.safeParse(body);
    if (!parsedBody.success) {
      console.error("Invalid Webhook Payload:", parsedBody.error.issues);
      return NextResponse.json(
        { message: "Invalid webhook payload format" },
        { status: 400 },
      );
    }
    const validPayload = parsedBody.data;

    if (!validPayload.transcript_text) {
      return NextResponse.json(
        { message: "Missing transcript text in successful payload" },
        { status: 400 },
      );
    }

    if (!validPayload.intelligence) {
      return NextResponse.json(
        { message: "Missing call intelligenece from payload" },
        { status: 400 },
      );
    }

    await prisma.job.update({
      where: { id: job.id },
      data: { status: "COMPLETED" },
    });

    await processCallWorkflow({
      body,
      customer,
      job,
    });

    return NextResponse.json(
      { message: "Upscale processed and saved successfully" },
      { status: 200 },
    );
  } catch (error: any) {
    console.error(
      `Upscale Webhook Handler Error for ${customer.id}:`,
      error.message || error,
    );
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 },
    );
  }
}
