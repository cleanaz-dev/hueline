import { Customer, SystemTask } from "@/app/generated/prisma";
import { NextResponse } from "next/server";
import { MockupTriggerSource, processMockupWorkflow } from "./process-voice-mockup-workflow";


export async function handleVoiceMockupWebhook(
  body: unknown,
  job: SystemTask,
  customer: Customer,
  triggerSource: string,
) {
  const source: MockupTriggerSource =
    (body as any).slug === "demo" ? "DEMO_VOICE_AGENT" : "STANDARD_VOICE_AGENT";

  try {
    await processMockupWorkflow({
      webhookBody: body,
      triggerSource: source,
      job,
      customer,
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    console.error("[handleVoiceMockupWebhook] Error:", error.message || error);
    return NextResponse.json(
      { message: "Voice mockup workflow failed" },
      { status: 500 },
    );
  }
}