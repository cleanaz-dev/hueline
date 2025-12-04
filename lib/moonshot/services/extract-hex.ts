
import { moonshot } from "../config";

interface HexColor {
  hex: string;
  color: string;
}

export const extractHex = async (imageUrl: string): Promise<HexColor | null> => {
  try {
    const imageResponse = await fetch(imageUrl);
    const arrayBuffer = await imageResponse.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString("base64");

    const response = await moonshot.chat.completions.create({
      model: "moonshot-v1-8k-vision-preview",
      messages: [
        {
          role: "system",
          content:
            "You are Kimi, an AI assistant provided by Moonshot AI, who excels in HEX color extraction for interior decorators.",
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Extract the dominant HEX color from walls in image.
Return ONLY a JSON, example:
{"hex":"#HEXCODE","color":"name"}`,
            },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${base64}`,
              },
            },
          ],
        },
      ],
      max_tokens: 500,
      temperature: 0.3,
    });

    let raw = response.choices[0]?.message?.content?.trim() || "{}";
    
    if (raw.startsWith("```")) {
      raw = raw.replace(/```json|```/g, "").trim();
    }

    const extractedColors: HexColor = JSON.parse(raw);
    console.log("🎁 Adjusted RAL colour identified:", extractedColors);

    return extractedColors;
  } catch (error) {
    console.error("❌ Failed to extract RAL color:", error);
    return null;
  }
};