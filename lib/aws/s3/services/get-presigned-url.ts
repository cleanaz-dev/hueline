import { GetObjectCommand, PutObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { buffer } from 'stream/consumers';
import sharp from 'sharp';
import { s3Client, S3_BUCKET_NAME } from '../config';

const MMS_PREFIX = 'compressed-mms/';

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

export async function getPresignedUrls(
  keys: string[],
  expiresIn: number = 3600
): Promise<string[]> {
  return Promise.all(keys.map((key) => getPresignedUrl(key, expiresIn)));
}

// 🆕 NEW: Compress on-demand for MMS
export async function getCompressedMmsUrl(key: string): Promise<string> {
  const compressedKey = `${MMS_PREFIX}${key.replace(/\.[^.]+$/, '.jpg')}`;
  
  // Check if compressed version already exists
  try {
    await s3Client.send(new HeadObjectCommand({
      Bucket: S3_BUCKET_NAME,
      Key: compressedKey
    }));
    return getPresignedUrl(compressedKey);
  } catch (err: any) {
    if (err.name !== 'NotFound') throw err;
  }

  // Get original → compress → upload → return URL
  const response = await s3Client.send(new GetObjectCommand({
    Bucket: S3_BUCKET_NAME,
    Key: key
  }));
  
  // Use buffer() from stream/consumers (works with older SDKs)
  const imageBuffer = await buffer(response.Body as any);
  if (!imageBuffer) throw new Error('Failed to fetch image');

  // Compress with retry
  let compressed = await sharp(imageBuffer)
    .resize(1200, 1200, { fit: 'inside', withoutEnlargement: true })
    .jpeg({ quality: 80 })
    .toBuffer();

  let quality = 80;
  while (compressed.length > 4.5 * 1024 * 1024 && quality > 20) {
    quality -= 15;
    compressed = await sharp(imageBuffer)
      .resize(1200, 1200, { fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality })
      .toBuffer();
  }

  // Upload compressed version
  await s3Client.send(new PutObjectCommand({
    Bucket: S3_BUCKET_NAME,
    Key: compressedKey,
    Body: compressed,
    ContentType: 'image/jpeg'
  }));

  return getPresignedUrl(compressedKey);
}

