import { getRedisClient, keys, logWithTime } from "../config";

export async function updateBookingWithAltMockup(
  phoneNumber: string, 
  altMockupS3Key: string, 
  expirationSeconds = 3600
) {
  const client = await getRedisClient();
  const key = keys.booking(phoneNumber);
  
  const existingData = await client.get(key);
  
  if (!existingData) {
    logWithTime(`❌ No existing booking found for ${phoneNumber}`);
    return null;
  }
  
  const bookingData = JSON.parse(existingData);
  bookingData.alt_mockup_s3_key = altMockupS3Key; // Store key, not URL
  
  await client.setEx(key, expirationSeconds, JSON.stringify(bookingData));
  logWithTime(`✅ Updated booking with alt mockup S3 key for ${phoneNumber}`);
  
  return bookingData;
}