//lib/moonshot/services/select-closest-ral.ts
import { moonshot } from "../config";
import { getRalHexName } from "@/lib/utils/server";

interface HexColor {
  hex: string;
  color: string;
}

export async function selectClosestRAL(extractedColor: HexColor) {
  try {
    console.log("🔍 INPUT TO selectClosestRAL:", extractedColor);
    const allColors = getRalHexName();
    console.log("📊 Total RAL colors loaded:", allColors.length);
    
    const filteredColors = allColors.filter(ral => 
      ral.name.toLowerCase().includes(extractedColor.color.toLowerCase())
    );
    
    console.log("🎯 Filtered colors count:", filteredColors.length);
    console.log("🎯 Filter keyword:", extractedColor.color);
    
    const colorsToUse = filteredColors.length > 0 ? filteredColors : allColors;
    console.log("🎨 Using colors:", filteredColors.length > 0 ? "FILTERED" : "ALL");

    console.log("🚀 Calling AI with", colorsToUse.length, "colors");

    const response = await moonshot.chat.completions.create({
      model: "kimi-k2-turbo-preview",
      messages: [
        {
          role: "system",
          content: "You are Kimi, an AI assistant provided by Moonshot AI, who excels in RAL Color selection for interior decorators."
        },
        {
          role: "user",
          content: `Select the closest RAL color to: ${extractedColor.hex} (${extractedColor.color})
          
ONLY USE Available RAL colors:
${colorsToUse.map(c => `${c.ral}: ${c.name} (${c.hex})`).join('\n')}

Return ONLY JSON:
{"ral":"RAL XXXX","name":"Color Name","hex":"#HEXCODE"}`
        }
      ],
      max_completion_tokens: 500,
      temperature: 0.3,
    });

    console.log("✅ AI Response received");
    const raw = response.choices[0]?.message?.content?.trim() || "{}";
    console.log("📤 RAW AI RESPONSE:", raw);
    
    const cleaned = raw.replace(/```json|```/g, "").trim();
    console.log("🧹 CLEANED RESPONSE:", cleaned);
    
    const parsed = JSON.parse(cleaned);
    console.log("✨ PARSED RESULT:", parsed);
    
    return parsed;
  } catch (error) {
    console.error("❌ Failed to select RAL:", error);
    console.error("❌ Error details:", JSON.stringify(error, null, 2));
    return null;
  }
}