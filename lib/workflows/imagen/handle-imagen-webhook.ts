
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { processImagenWorkflow } from "./process-imagen-workflow";
import { SystemTask, Customer } from "@/app/generated/prisma";
import { designImagenLambdaIngestSchema } from "@/lib/zod/design-imagen-body-schema";
import { releaseResourceLock } from "@/lib/redis";



export async function handleImagenWebhook(body: any, job: SystemTask, customer: Customer) {
  const parsedBody = designImagenLambdaIngestSchema.safeParse(body);
  
  if (!parsedBody.success) {
    console.error("Invalid Webhook Payload:", parsedBody.error.issues);
    // Safety check: Release the lock if the payload is completely corrupted 
    // to prevent the user from being stuck in a loading state.
    await releaseResourceLock(job.lockKey)
    return NextResponse.json(
      { message: "Invalid webhook payload format" },
      { status: 400 },
    );
  }
  const validPayload = parsedBody.data;

  // 3. Update the database task status
  await prisma.systemTask.update({ where: { id: job.id }, data: { status: "COMPLETED" } });

  // 4. Release the Redis Lock! 
  // SWR polling in your Context will instantly catch that the lock is gone and trigger the UI re-fetch.
 await releaseResourceLock(job.lockKey) 

  try {
    await processImagenWorkflow({
      webhookBody: validPayload,
      triggerSource: validPayload.action,
      job,
      customer,
    });
  } catch (workflowError) {
    console.error("Workflow processing failed:", workflowError);
    // Note: The lock is already deleted, so the user can retry even if the ingestion workflow failed.
  }

  return NextResponse.json({ message: "Mockup processed and saved successfully" }, { status: 200 });
}