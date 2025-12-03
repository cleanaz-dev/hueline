import { PutObjectCommand } from "@aws-sdk/client-s3";
import { s3Client, S3_BUCKET_NAME } from "../config";

export async function uploadMockupToS3(
  url: string,
  bookingId: string
): Promise<string> {
  const timestamp = Date.now();
  const response = await fetch(url);
  const buffer = await response.arrayBuffer();
  const key = `ai_generated/${bookingId}/images/${timestamp}`;

  const command = new PutObjectCommand({
    Bucket: S3_BUCKET_NAME,
    Key: key,
    Body: Buffer.from(buffer),
    ContentType: "image/jpeg",
  });
  await s3Client.send(command);
  return key;
}
