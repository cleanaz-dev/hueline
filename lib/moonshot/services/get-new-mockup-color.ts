import {
  MAIN_COLOR_SHADES,
  TRENDING_COLOR_SHADES,
  BrandId,
  PaintColor,
} from "@/lib/config/paint-config";
import { CurrentColor, TargetColor } from "@/types/paint-types";
import { moonshot } from "../config";

function getMainColors(brand?: string): PaintColor[] {
  if (brand && MAIN_COLOR_SHADES[brand as BrandId]) {
    return MAIN_COLOR_SHADES[brand as BrandId];
  }
  return Object.values(MAIN_COLOR_SHADES).flat();
}

function filterByFamily(colors: PaintColor[], family?: string): PaintColor[] {
  if (!family) return colors;
  const filtered = colors.filter((c) => c.family === family);
  return filtered.length > 0 ? filtered : colors;
}

export async function getNewMockUpColorMoonshot(
  colorInput: CurrentColor | CurrentColor[], // Accept the object or the array
  option: string,
  targetColor?: TargetColor 
) {
  // 1. SAFELY unwrap the array if it exists (Fixes the array bug)
  const color = Array.isArray(colorInput) ? colorInput[0] : colorInput;

  // 2. DYNAMICALLY extract properties
  const activeBrand = option === "shade" ? targetColor?.brand : color.brand;
  
  // color.family doesn't exist in your DB schema, so we safely fall back to undefined
  // For 'shade', we still use the targetColor family if provided
  const activeFamily = option === "shade" ? targetColor?.family : (color as any).family;
  
  const brandLabel = activeBrand ?? "paint";

  // ── Build color map ──────────────────────────────────────────────────────
  let color_map: PaintColor[] | Record<string, PaintColor[]>;

  if (option === "trendy") {
    color_map = TRENDING_COLOR_SHADES;
  } else if (["brighter", "darker", "shade"].includes(option)) {
    // If activeFamily is undefined, filterByFamily safely returns the whole brand list
    color_map = filterByFamily(getMainColors(activeBrand), activeFamily);
  } else {
    color_map = getMainColors(activeBrand);
  }

  // ── Build prompt ─────────────────────────────────────────────────────────
  // We add color.name to the base prompt so the AI knows it's "Pale green" even without a family property
  const base = `You are an experienced interior decorator.
Current color: ${color.name || "Unknown"} (${JSON.stringify(color.hex)}).
Available colors database: ${JSON.stringify(color_map)}.`;

  const familyContext = activeFamily ? `the "${activeFamily}"` : `the same`;

  const instruction =
    option === "brighter" || option === "darker"
      ? `Select a ${brandLabel} color from the database that is noticeably ${option} than the current color, but stays in ${familyContext} color family (e.g. if current is green, stay in greens). If none are perfect, pick a lighter color.`
      : option === "shade"
      ? `Select a ${brandLabel} color from ${familyContext} family that is NOT similar to the current color.`
      : `Select a completely different ${brandLabel} color that does NOT share the same family, name, or visual similarity to the current color. Be unpredictable.`;

  const userPrompt = `${base}\n\nTask: ${instruction}\n\nIMPORTANT: Return strictly a valid JSON object. Do not return an empty {}. You MUST choose one color from the provided list.\nFormat:\n{"brand":"Brand Name","name":"Color Name","code":"color code","hex":"#XXXXXX"}`;

  // ── Call Moonshot ─────────────────────────────────────────────────────────
  try {
    const response = await moonshot.chat.completions.create({
      model: "kimi-k2-thinking-turbo",
      messages:[{ role: "user", content: userPrompt }],
      response_format: { type: "json_object" },
      temperature: 1, 
      max_completion_tokens: 10000,
    });

    const content = response.choices[0]?.message?.content?.trim() || "{}";
    const colorChoice = JSON.parse(content) as PaintColor;

    console.log("RAW Moonshot Color Choice:", colorChoice);

    if (!colorChoice.hex || Object.keys(colorChoice).length === 0) {
      console.error("Moonshot returned empty or invalid JSON:", content);
      throw new Error("No valid hex found in color choice");
    }

    return colorChoice;
    
  } catch (error) {
    console.error("Error getting color from Moonshot:", error);
    throw error;
  }
}