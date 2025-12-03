// lib/utils/watermark.ts
import sharp from "sharp";

interface WatermarkOptions {
  position?: "bottom-right" | "bottom-left" | "top-right" | "top-left" | "center";
  scale?: number;
  margin?: number;
  opacity?: number; // ✅ 0 to 1 (0 = transparent, 1 = opaque)
}

export async function addWatermarkToImage(
  imageBuffer: Buffer,
  watermarkUrl: string,
  options: WatermarkOptions = {}
): Promise<Buffer> {
  const {
    position = "bottom-right",
    scale = 0.1,
    margin = 20,
    opacity = 0.5 // ✅ Default 50% opacity
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

    const logoWidth = Math.floor(imageWidth * scale);
    
    // ✅ Apply opacity to the watermark
    const resizedLogo = await sharp(logoBuffer)
      .resize({ width: logoWidth })
      .composite([{
        input: Buffer.from([255, 255, 255, Math.round(opacity * 255)]),
        raw: {
          width: 1,
          height: 1,
          channels: 4
        },
        tile: true,
        blend: 'dest-in' // Apply opacity mask
      }])
      .toBuffer();

    const logoMetadata = await sharp(resizedLogo).metadata();
    const logoHeight = logoMetadata.height || 0;

    let left = 0, top = 0;
    
    switch (position) {
      case "bottom-right":
        left = imageWidth - logoWidth - margin;
        top = imageHeight - logoHeight - margin;
        break;
      case "bottom-left":
        left = margin;
        top = imageHeight - logoHeight - margin;
        break;
      case "top-right":
        left = imageWidth - logoWidth - margin;
        top = margin;
        break;
      case "top-left":
        left = margin;
        top = margin;
        break;
      case "center":
        left = Math.floor((imageWidth - logoWidth) / 2);
        top = Math.floor((imageHeight - logoHeight) / 2);
        break;
    }

    const watermarkedBuffer = await image
      .composite([{
        input: resizedLogo,
        left: left,
        top: top,
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