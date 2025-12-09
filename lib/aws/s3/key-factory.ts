// lib/s3-paths.ts
import { v4 as uuidv4 } from "uuid";

export const S3Keys = {
  // 1. Branding (Public - served via CloudFront)
  // Usage: S3Keys.branding("sub_123", "logo.png")
  branding: (subdomainId: string, fileName: string) => 
    `subdomains/${subdomainId}/public/${sanitize(fileName)}`,

  // 2. Booking Uploads (Private - requires Presigned URL)
  // Usage: S3Keys.bookingUpload("sub_123", "book_456", "room.jpg")
  bookingUpload: (subdomainId: string, bookingId: string, fileName: string) => 
    `subdomains/${subdomainId}/bookings/${bookingId}/uploads/${uniqueName(fileName)}`,

  // 3. AI Generations (Private - requires Presigned URL)
  // Usage: S3Keys.bookingGeneration("sub_123", "book_456", "variation_1.jpg")
  bookingGeneration: (subdomainId: string, bookingId: string, fileName: string) => 
    `subdomains/${subdomainId}/bookings/${bookingId}/generated/${uniqueName(fileName)}`,
};

// --- Helpers ---

// Keeps the extension, but replaces the name with a UUID to prevent overwrites
// Input: "my-room.jpg" -> Output: "123e4567-e89b-....jpg"
function uniqueName(fileName: string) {
  const ext = fileName.split('.').pop();
  return `${uuidv4()}.${ext}`;
}

// Just cleans up spaces/special chars if you want to keep original names
function sanitize(fileName: string) {
  return fileName.replace(/[^a-zA-Z0-9.\-_]/g, "_").toLowerCase();
}