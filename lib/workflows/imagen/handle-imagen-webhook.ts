import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { processImagenWorkflow, ImagenTriggerSource } from "./process-imagen-workflow";
import { Job, Customer } from "@/app/generated/prisma";

export async function handleImagenWebhook(
  body: any,
  triggerSource: ImagenTriggerSource,
  job: Job,
  customer: Customer
) {
  try {
    // 1. Basic Validation
    if (!body.s3Key) return NextResponse.json({ message: "Missing s3Key" }, { status: 400 });
    if (!body.huelineId) return NextResponse.json({ message: "Missing huelineId" }, { status: 400 });
    if (!customer.phone && !customer.email) {
      return NextResponse.json({ message: "No contact method found for client" }, { status: 400 });
    }



    // 2. Mark Job as Success
    await prisma.job.update({ where: { id: job.id }, data: { status: "COMPLETED" } });

    // 3. Pass everything to the Processor
    await processImagenWorkflow({
      webhookBody: body,
      triggerSource,
      job,
      customer,
    });

    return NextResponse.json({ message: "Mockup processed and saved successfully" }, { status: 200 });

  } catch (error: any) {
    console.error(`Webhook Handler Error for ${customer.id}:`, error.message || error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}