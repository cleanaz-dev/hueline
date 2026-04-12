"use server";

import { getPresignedUrl } from "@/lib/aws/s3";

// Import your existing getPresignedUrl function
// <-- Update this path to where your function lives

export async function generateFreshDownloadLink(originalUrl: string) {
  try {
    const urlObj = new URL(originalUrl);
    const key = urlObj.pathname.substring(1); 
    
    let freshUrl = await getPresignedUrl(key, 3600);
    
    // 🔥 FIX: Force HTTPS if AWS SDK generated an HTTP url
    if (freshUrl.startsWith("http://")) {
      freshUrl = freshUrl.replace("http://", "https://");
    }
    
    return freshUrl;
  } catch (error) {
    console.error("Error generating presigned URL:", error);
    throw new Error("Failed to generate secure download link.");
  }
}