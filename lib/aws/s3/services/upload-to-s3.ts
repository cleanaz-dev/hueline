import { PutObjectCommand } from '@aws-sdk/client-s3';
import { s3Client, S3_BUCKET_NAME } from '../config';

export async function uploadToS3(
  file: Buffer, 
  key: string, 
  contentType: string
): Promise<string> {
  const command = new PutObjectCommand({
    Bucket: S3_BUCKET_NAME,
    Key: key,
    Body: file,
    ContentType: contentType,
  });

  await s3Client.send(command);
  return key;
}