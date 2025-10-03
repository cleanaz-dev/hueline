//  lib/replicate.ts
import Replicate from "replicate";
import { uploadToCloudinary } from "./cloudinary";

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

const model = "google/nano-banana";

export async function generateAltMockup(
  prompt: string,
  image_input: string[],
  removeFurniture: boolean = false,
  output_format: string = "jpg"
) {
console.log("🎨 Prompt:", prompt)
  let newPrompt
if (removeFurniture) {
  newPrompt = `${prompt}. Remove ALL furniture, objects, and obstructions from the image. The scene must ONLY show clean, empty surfaces and walls, with no items, no chairs, no tables, no decorations, no clutter.`;
} else {
  newPrompt = `${prompt}`;
}

  try {
    const input = {
      prompt: newPrompt,
      image_input: image_input,
      output_format: output_format,
    };

    const output = await replicate.run(model, { input });

    const firstOutput = Array.isArray(output) ? output[0] : output;

    // Get the URL string from the FileOutput object
    const imageUrl = firstOutput.url().href;

    // Upload to Cloudinary and return the secure URL
    const secureUrl = await uploadToCloudinary(imageUrl, "hueline");
    return secureUrl;
  } catch (error) {
    console.error("Error generating mockup:", error);
    throw error;
  }
}
