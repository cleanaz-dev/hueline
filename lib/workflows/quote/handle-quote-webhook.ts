import { Customer, SystemTask } from "@/app/generated/prisma";
import { prisma } from "@/lib/prisma/config";
import { releaseResourceLock } from "@/lib/redis";
import { handlerQuoteWebhookSchema } from "@/lib/zod/quotes/handler-quote-webhook-schema";
import { NextResponse } from "next/server";
import { processQuoteWorkflow } from "./process-quote-workflow";

export async function handleQuoteGenerationWebhook(body: any, job: SystemTask, customer: Customer) {
  console.log("Received Quote Generation Webhook with body:", body);
  
  const parsedBody = handlerQuoteWebhookSchema.safeParse(body);  
  if (!parsedBody.success) {
    console.error("Invalid Webhook Payload:", parsedBody.error.issues);
    // Safety check: Release the lock if the payload is corrupted
    await releaseResourceLock(job.lockKey);
    return NextResponse.json(
      { message: "Invalid webhook payload format" },
      { status: 400 },
    );
  }
  
  const validPayload = parsedBody.data; 

  try {
    // 1. PROCESS AND SAVE THE DB RECORDS FIRST!
    await processQuoteWorkflow({
      webhookBody: validPayload,
      triggerSource: validPayload.action,
      job,
      customer,
    });

    // 2. Mark task as completed ONLY if workflow actually succeeded
    await prisma.systemTask.update({ 
      where: { id: job.id }, 
      data: { status: "COMPLETED" } 
    });

    return NextResponse.json(
      { message: "Quote processed and saved successfully" }, 
      { status: 200 }
    );

  } catch (workflowError) {
    console.error("Workflow processing failed:", workflowError);
    
    // Optional: Mark task as failed so you have a record of it
    await prisma.systemTask.update({ 
      where: { id: job.id }, 
      data: { status: "FAILED" } 
    });

    return NextResponse.json(
      { message: "Quote generation failed during processing" }, 
      { status: 500 }
    );

  } finally {
    // 3. FINALLY: RELEASE THE LOCK!
    // The 'finally' block ensures that no matter what happens above 
    // (success or error), the lock gets released at the VERY END.
    // This perfectly syncs with SWR so it only fetches AFTER the DB is ready.
    await releaseResourceLock(job.lockKey);
  }
}