import { Customer, SystemTask } from "@/app/generated/prisma";
import { prisma } from "@/lib/prisma/config";
import { releaseResourceLock } from "@/lib/redis";
import { handlerQuoteWebhookSchema } from "@/lib/zod/quotes/handler-quote-webhook-schema";
import { NextResponse } from "next/server";
import { processQuoteWorkflow } from "./process-quote-workflow";


export async function handleQuoteGenerationWebhook(body: any, job: SystemTask, customer: Customer) {
    // For now we don't have any specific payload validation for quote generation webhooks
    console.log("Received Quote Generation Webhook with body:", body);
    const parsedBody = handlerQuoteWebhookSchema.safeParse(body);  
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
         await processQuoteWorkflow({
           webhookBody: validPayload,
           triggerSource: validPayload.action,
           job,
           customer,
         });
       } catch (workflowError) {
         console.error("Workflow processing failed:", workflowError);
         // Note: The lock is already deleted, so the user can retry even if the ingestion workflow failed.
       }
     
       return NextResponse.json({ message: "Quote processed and saved successfully" }, { status: 200 });
     }