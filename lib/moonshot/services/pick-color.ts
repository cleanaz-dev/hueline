import { moonshot } from "../config";
import { MAIN_COLOR_SHADES } from "@/lib/config/paint-config";

// Matches your Mockup and PaintColor schema data
export interface ColorData {
  name: string;
  hex: string;
  code: string;
  brand: string;
}

interface PickedColor {
  brand: string;
  name: string;
  code: string;
  hex: string;
}

export async function pickColor(
  usedColors: ColorData[],
): Promise<PickedColor | null> {
  const systemPrompt = `You are an expert, high-end interior designer. Your job is to select the perfect Benjamin Moore paint color to wow a client. 
You will be provided with the colors the client has already tested. 
Choose a color from the provided palette that either perfectly complements their previous choices or provides a stunning, creative contrast.
You MUST respond with ONLY a raw JSON object. Do not include markdown formatting, backticks, or conversational text.`;

  const userPrompt = `
Previously tested colors by client: ${JSON.stringify(usedColors)}

Available Palette to choose from: ${JSON.stringify(MAIN_COLOR_SHADES)}

Return exactly this JSON format:
{
 "brand": "Brand Name",
  "name": "Color Name",
  "code": "Color Code",
  "hex": "#000000"
}`;

  try {
    const response = await moonshot.chat.completions.create({
      model: "kimi-k2-thinking-turbo",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      max_tokens: 10000, // JSON is short, don't need many tokens
      temperature: 0.7,
      response_format: { type: "json_object" }, // A little creativity
    });

    const result = response.choices[0]?.message?.content?.trim();

    if (!result) return null;

    // Parse the JSON safely (strips out any accidental markdown backticks Kimi might add)
    const cleanJson = result
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();
    return JSON.parse(cleanJson) as PickedColor;
  } catch (error) {
    console.error("AI Color Selection Failed:", error);
    return null; // Fallback handled in the CRON loop
  }
}
