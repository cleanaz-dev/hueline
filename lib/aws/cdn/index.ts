const CLOUDFRONT_DOMAIN = "https://cdn.hue-line.com"; 

export function getPublicUrl(s3Key: string | null | undefined) {
  if (!s3Key) return null;
  
  // 1. If it's already a full URL (Google auth image, external link), leave it
  if (s3Key.startsWith("http")) return s3Key;
  
  // 2. If it's a local static file (e.g. /placeholder.png), leave it
  if (s3Key.startsWith("/")) return s3Key;

  // 3. Clean up the key to prevent "https://cdn.com//folder"
  // Remove leading slash if present
  const cleanKey = s3Key.startsWith("/") ? s3Key.slice(1) : s3Key;

  // 4. Combine
  return `${CLOUDFRONT_DOMAIN}/${cleanKey}`;
}