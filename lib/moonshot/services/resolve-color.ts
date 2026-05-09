import { MoonShotColorChoice, CurrentColor, TargetColor } from "@/types/paint-types";
import { getNewMockUpColorMoonshot } from "@/lib/moonshot";

export async function resolveNewColor(
  option: string,
  currentColor: CurrentColor,
  targetColor?: TargetColor,
): Promise<MoonShotColorChoice> {
  if (option === "brighter" || option === "darker" || option === "trendy") {
    return getNewMockUpColorMoonshot(currentColor, option, targetColor);
  }

  // "shade" — use targetColor directly
  if (!targetColor?.brand || !targetColor?.name || !targetColor?.code || !targetColor?.hex) {
    throw new Error("targetColor is required for shade option");
  }

  return {
    brand: targetColor.brand,
    name: targetColor.name,
    code: targetColor.code,
    hex: targetColor.hex,
  };
}