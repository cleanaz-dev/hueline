import { GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { s3Client, S3_BUCKET_NAME } from '../config';

export async function getPresignedUrl(
  key: string, 
  expiresIn: number = 3600
): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: S3_BUCKET_NAME,
    Key: key,
  });

  const url = await getSignedUrl(s3Client, command, { expiresIn });
  return url;
}