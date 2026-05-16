import { GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { s3Client, S3_BUCKET_NAME } from '../config';


// NEW: Used for UPLOADING images securely from the frontend
export async function getUploadPresignedUrl(
  key: string,
  contentType: string, // <-- Crucial: AWS needs to know the file type
  expiresIn: number = 3600
): Promise<string> {
  const command = new PutObjectCommand({
    Bucket: S3_BUCKET_NAME,
    Key: key,
    ContentType: contentType, // e.g., 'image/jpeg' or 'image/png'
  });

  return getSignedUrl(s3Client, command, { expiresIn });
}