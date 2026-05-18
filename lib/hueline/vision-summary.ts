interface VisionProps {
  originalImageUrl: string;
  newImagenUrl: string;
}

export async function generateVisionSummary({
  originalImageUrl,
  newImagenUrl,
}: VisionProps) {
  const imageResponse = await fetch(originalImageUrl);
  const arrayBuffer = await imageResponse.arrayBuffer();
  const base64 = Buffer.from(arrayBuffer).toString("base64");
}
