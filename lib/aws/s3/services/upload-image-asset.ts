import { PutObjectCommand } from '@aws-sdk/client-s3';
import { s3Client, S3_BUCKET_NAME } from '../config';

export async function uploadImageAsset(
  file: Buffer, 
  keyString: string,
  contentType: string,
  customerId: string
): Promise<string> {

  const key = `${keyString}/customers/${customerId}/images/${Date.now()}`
  const command = new PutObjectCommand({
    Bucket: S3_BUCKET_NAME,
    Key: key,
    Body: file,
    ContentType: contentType,
  });

  await s3Client.send(command);
  return key;
}