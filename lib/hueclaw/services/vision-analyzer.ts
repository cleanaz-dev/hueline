import { createCommand, lambda } from "@/lib/aws/lambda";

export interface VisionTags {
  room_type: string;
  has_furniture: boolean;
  paintable: boolean;
  description: string;
}

export async function analyzeImageWithVision(s3Key: string): Promise<VisionTags | null> {
  try {
    const visionCommand = createCommand({
      functionName: "hueline-hueclaw-vision-PROD",
      payload: { s3Key },
      invocationType: "RequestResponse"
    });

    const response = await lambda.send(visionCommand);

    if (!response.Payload) {
      console.warn("[vision-analyzer] No payload returned from Lambda execution.");
      return null;
    }

    // Decode the response buffer
    const payloadString = Buffer.from(response.Payload).toString();
    const parsedPayload = JSON.parse(payloadString);

    if (parsedPayload.statusCode !== 200) {
      console.warn("[vision-analyzer] Lambda returned an error status:", parsedPayload.statusCode);
      return null;
    }

    return JSON.parse(parsedPayload.body) as VisionTags;
  } catch (error) {
    console.error("[vision-analyzer] Error invoking vision lambda:", error);
    return null;
  }
}