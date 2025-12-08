export function generateSharedLink(slug: string, huelineId: string): string {
  const protocol = process.env.NODE_ENV === "production" ? "https" : "http";
  const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "hue-line.com";
  
  const domain = process.env.NODE_ENV === "production" 
    ? `${slug}.${rootDomain}`
    : `${slug}.localhost:3000`;

  return `${protocol}://${domain}/booking/${huelineId}`;
}