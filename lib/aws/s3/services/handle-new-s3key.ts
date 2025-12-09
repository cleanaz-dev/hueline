import { PutObjectCommand } from "@aws-sdk/client-s3";
import { s3Client, S3_BUCKET_NAME } from "../config";

export interface S3UploadParams {
  url: string;
  huelineId: string;
  subdomainId: string;
  isMockup?: boolean;
}

export async function handleNewS3Key({
  url,
  huelineId,
  subdomainId,
  isMockup = false
}: S3UploadParams): Promise<string> {
  const timestamp = Date.now();
  const response = await fetch(url);
  const buffer = await response.arrayBuffer();
  
  const folder = isMockup ? "generated" : "uploads";
  const key = `subdomains/${subdomainId}/bookings/${huelineId}/${folder}/${timestamp}`;

  const command = new PutObjectCommand({
    Bucket: S3_BUCKET_NAME,
    Key: key,
    Body: Buffer.from(buffer),
    ContentType: "image/jpeg",
  });
  
  await s3Client.send(command);

  return key;
}