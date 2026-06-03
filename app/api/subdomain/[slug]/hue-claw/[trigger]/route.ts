import { NextResponse } from "next/server";
import { triggerHueClawWorker } from "@/lib/aws/lambda/trigger-hueclaw-worker";

interface Params {
  params: Promise<{
    slug: string;
    trigger: string;
  }>;
}

export async function POST(req: Request, { params }: Params) {
  const { slug, trigger } = await params;

  if (!slug || !trigger) {
    return NextResponse.json({ message: "Invalid Requests" }, { status: 401 });
  }
  const body = await req.json();

  // 1. The Switchboard logic
  let workerName = "";
  if (trigger === "comms") {
    workerName = "hueline-hueclaw-comms-PROD";
  } else if (trigger === "imagen") {
    workerName = "hueline-hueclaw-imagen-PROD";
  } else {
    return NextResponse.json({ error: "Unknown trigger" }, { status: 400 });
  }

  // 2. Set your Redis Lock here (so the UI shows loading)
  // await setRedisLock(...)

  // 3. Call the Helper Function (Use the Intercom)
  await triggerHueClawWorker(workerName, body);

  // 4. Hang up and return success to the frontend instantly
  return NextResponse.json({
    message: `Successfully told the ${trigger} worker to start!`,
  });
}
