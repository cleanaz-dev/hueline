import { replicate, models } from "../config";

export async function imageToText(base64: string) {
  const prompt = "Describe the image";

  const image = base64;
  try {
    const input = { image, prompt };

    const output = await replicate.run(models.moondream2, { input });

    const finalOutput = Array.isArray(output) 
      ? output.join("") 
      : String(output);
    
    return finalOutput;
  } catch (error) {
    console.error("Error in imageToText:", error);
    throw error;
  }
}