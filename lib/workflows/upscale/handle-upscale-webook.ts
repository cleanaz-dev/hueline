import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

import { Job, DemoClient } from "@/app/generated/prisma";
import { processUpscaleWorkflow } from "./process-upscale-workflow";

export async function handleUpscaleWebhook(
  body: any,
  job: Job,
) {
  try {
    // 1. Basic Validation
    if (!body.s3Key) return NextResponse.json({ message: "Missing s3Key" }, { status: 400 });
    if (!body.huelineId) return NextResponse.json({ message: "Missing huelineId" }, { status: 400 });
    // if (!demoClient.phone && !demoClient.email) {
    //   return NextResponse.json({ message: "No contact method found for client" }, { status: 400 });
    // }



    // 2. Mark Job as Success
    await prisma.job.update({ where: { id: job.id }, data: { status: "COMPLETED" } });

    // 3. Pass everything to the Processor
await processUpscaleWorkflow()

    return NextResponse.json({ message: "Mockup processed and saved successfully" }, { status: 200 });

  } catch (error: any) {
    // console.error(`Webhook Handler Error for ${demoClient.id}:`, error.message || error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}