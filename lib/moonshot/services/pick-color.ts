import { moonshot } from "../config";

// Matches your Mockup and PaintColor schema data
export interface ColorData {
  name: string;
  hex: string;
}

interface PickedColor {
  name: string;
  code: string;
  hex: string;
}

// A premium list to ensure Kimi picks real, high-end Benjamin Moore colors with exact hexes
const BENJAMIN_MOORE_PALETTE =[
  { name: "Hale Navy", code: "HC-154", hex: "#3b444b" },
  { name: "Swiss Coffee", code: "OC-45", hex: "#efebd8" },
  { name: "Revere Pewter", code: "HC-172", hex: "#ccc7b9" },
  { name: "White Dove", code: "OC-17", hex: "#eeede7" },
  { name: "Aegean Teal", code: "2136-40", hex: "#4e7379" },
  { name: "Kendall Charcoal", code: "HC-166", hex: "#505250" },
  { name: "Chantilly Lace", code: "OC-65", hex: "#f4f6f1" },
  { name: "Edgecomb Gray", code: "HC-173", hex: "#d9d7cd" },
  { name: "Navajo White", code: "OC-95", hex: "#e5d4b4" },
  { name: "Salamander", code: "2050-10", hex: "#263833" }
];

export async function pickColor(usedColors: ColorData[]): Promise<PickedColor | null> {
  const systemPrompt = `You are an expert, high-end interior designer. Your job is to select the perfect Benjamin Moore paint color to wow a client. 
You will be provided with the colors the client has already tested. 
Choose a color from the provided palette that either perfectly complements their previous choices or provides a stunning, creative contrast.
You MUST respond with ONLY a raw JSON object. Do not include markdown formatting, backticks, or conversational text.`;

  const userPrompt = `
Previously tested colors by client: ${JSON.stringify(usedColors)}

Available Palette to choose from: ${JSON.stringify(BENJAMIN_MOORE_PALETTE)}

Return exactly this JSON format:
{
  "name": "Color Name",
  "code": "Color Code",
  "hex": "#000000"
}`;

  try {
    const response = await moonshot.chat.completions.create({
      model: "kimi-k2.6",
      messages:[
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      max_tokens: 150, // JSON is short, don't need many tokens
      temperature: 0.7, // A little creativity
    });

    const result = response.choices[0]?.message?.content?.trim();
    
    if (!result) return null;

    // Parse the JSON safely (strips out any accidental markdown backticks Kimi might add)
    const cleanJson = result.replace(/```json/g, "").replace(/```/g, "").trim();
    return JSON.parse(cleanJson) as PickedColor;

  } catch (error) {
    console.error("AI Color Selection Failed:", error);
    return null; // Fallback handled in the CRON loop
  }
}