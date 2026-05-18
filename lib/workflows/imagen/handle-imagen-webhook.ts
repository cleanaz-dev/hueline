import { z } from "zod";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { processImagenWorkflow } from "./process-imagen-workflow";
import { SystemTask, Customer } from "@/app/generated/prisma";
import { designImagenBodySchema, designImagenLambdaIngestSchema } from "@/lib/zod/design-imagen-body-schema";



export async function handleImagenWebhook(body: any, job: SystemTask, customer: Customer) {
  const parsedBody = designImagenLambdaIngestSchema.safeParse(body)
   if (!parsedBody.success) {
      console.error("Invalid Webhook Payload:", parsedBody.error.issues);
      return NextResponse.json(
        { message: "Invalid webhook payload format" },
        { status: 400 },
      );
    }
      const validPayload = parsedBody.data;

  if (!customer.phone && !customer.email) {
    return NextResponse.json({ message: "No contact method found for client" }, { status: 400 })
  }

  await prisma.systemTask.update({ where: { id: job.id }, data: { status: "COMPLETED" } })

  await processImagenWorkflow({
    webhookBody: validPayload,
    triggerSource: validPayload.action,
    job,
    customer,
  })

  return NextResponse.json({ message: "Mockup processed and saved successfully" }, { status: 200 })
}