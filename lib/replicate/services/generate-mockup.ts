import { replicate, models } from "../config";

export async function generateMockup(
  colorPrompt: string,
  image_input: string,
  removeFurniture: boolean = false,
  output_format: string = "jpg"
) {
  console.log("🎨 Prompt:", colorPrompt);

  // ✅ Convert string → array safely
  const imageArray = image_input
    ? [image_input]               // wrap as array
    : [];                         // fallback to empty array (prevents errors)

  const newPrompt = removeFurniture
    ? `${colorPrompt}. Remove ALL furniture, objects, and obstructions from the image. The scene must ONLY show clean, empty surfaces and walls, with no items, no chairs, no tables, no decorations, no clutter.`
    : `${colorPrompt}.`;

  try {
    const input = {
      prompt: newPrompt,
      image_input: imageArray,    // ✅ NOW AN ARRAY
      output_format,
    };

    const output = await replicate.run(models.nanoBanana, { input });
    const firstOutput = Array.isArray(output) ? output[0] : output;

    return firstOutput.url().href;
  } catch (error) {
    console.error("Error generating mockup:", error);
    throw error;
  }
}
