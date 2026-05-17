// lambda-utils/color-key-builder.ts

type BrandId = "sherwin_williams" | "benjamin_moore" | "behr" | "ral"

const BRAND_LABELS: Record<BrandId, string> = {
  "sherwin_williams": "Sherwin-Williams",
  "benjamin_moore": "Benjamin Moore",
  behr: "Behr",
  ral: "RAL",
}

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")
}

function slugifyCode(code: string): string {
  return code
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/--+/g, "-")
    .replace(/^-|-$/g, "")
}

/**
 * Pass in the payload from your frontend to instantly get the exact S3 Image URL 
 * to pass to Imagen.
 */
export function getColorSwatchUrl(brand: BrandId, name: string, code: string, bucketName: string): string {
  const brandSlug = slugify(BRAND_LABELS[brand])
  const nameSlug  = slugify(name)
  const codeSlug  = slugifyCode(code)

  const s3Key = `colors/${brand}/${brandSlug}-${nameSlug}-${codeSlug}.png`
  
  return `https://${bucketName}.s3.amazonaws.com/${s3Key}`
}