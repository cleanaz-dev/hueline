import { replicate, models } from "../config";

export async function generateMockup(
  colorPrompt: string,
  image_input: string,
  removeFurniture: boolean = false,
  output_format: string = "jpg",
  aspect_ratio: string = "match_input_image",
  resolution: string = "1K"
) {
  console.log("🎨 Prompt:", colorPrompt);

  // ✅ Convert string → array safely
  const imageArray = image_input
    ? [image_input]               // wrap as array
    : [];                         // fallback to empty array (prevents errors)

  const newPrompt = removeFurniture
    ? `${colorPrompt}. AND Remove ALL furniture.`
    : `${colorPrompt}. avoid door frames and window frames.`;

  try {
    const input = {
      prompt: newPrompt,
      image_input: imageArray,    // ✅ NOW AN ARRAY
      output_format,
      aspect_ratio,
      resolution
    };

    const output = await replicate.run(models.nanoBanana2, { input });
    const firstOutput = Array.isArray(output) ? output[0] : output;

    return firstOutput.url().href;
  } catch (error) {
    console.error("Error generating mockup:", error);
    throw error;
  }
}
