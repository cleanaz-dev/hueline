// lib/utils/watermark.ts
import sharp from "sharp";

interface WatermarkOptions {
  position?: "bottom-right" | "bottom-left" | "top-right" | "top-left" | "center";
  scale?: number;
  margin?: number;
  opacity?: number;
}

export async function addWatermarkToImage(
  imageBuffer: Buffer,
  watermarkUrl: string,
  options: WatermarkOptions = {}
): Promise<Buffer> {
  const {
    opacity = 0.5
  } = options;

  try {
    const logoResponse = await fetch(watermarkUrl);
    if (!logoResponse.ok) {
      throw new Error(`Failed to fetch watermark: ${logoResponse.statusText}`);
    }
    const logoArrayBuffer = await logoResponse.arrayBuffer();
    const logoBuffer = Buffer.from(logoArrayBuffer);

    const image = sharp(imageBuffer);
    const metadata = await image.metadata();
    const imageWidth = metadata.width || 1000;
    const imageHeight = metadata.height || 1000;

    // Resize watermark pattern to match image dimensions exactly
    const resizedLogo = await sharp(logoBuffer)
      .resize(imageWidth, imageHeight, { fit: 'fill' })
      .composite([{
        input: Buffer.from([255, 255, 255, Math.round(opacity * 255)]),
        raw: {
          width: 1,
          height: 1,
          channels: 4
        },
        tile: true,
        blend: 'dest-in'
      }])
      .toBuffer();

    const watermarkedBuffer = await image
      .composite([{
        input: resizedLogo,
        blend: 'over'
      }])
      .jpeg({ quality: 95 })
      .toBuffer();

    return watermarkedBuffer;

  } catch (error) {
    console.error("Error adding watermark:", error);
    throw error;
  }
}

export async function addWatermarkFromUrl(
  imageUrl: string,
  watermarkUrl: string,
  options: WatermarkOptions = {}
): Promise<Buffer> {
  try {
    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.statusText}`);
    }
    
    const arrayBuffer = await response.arrayBuffer();
    const imageBuffer = Buffer.from(arrayBuffer);
    
    return await addWatermarkToImage(imageBuffer, watermarkUrl, options);
    
  } catch (error) {
    console.error("Error processing image from URL:", error);
    throw error;
  }
}