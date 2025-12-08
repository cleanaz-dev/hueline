import {
  filterColorsByHue,
  RANDOM_COLOR_MAP,
  TRENDY_COLOR_MAP,
  extractMainHue,
} from "@/lib/utils";
import { moonshot } from "../config";
import { getRalClassicColors } from "@/lib/utils/server";
import { PaintColor } from "@/types/subdomain-type";

export async function getNewMockUpColorMoonshot(
  color: PaintColor,
  option: string
) {
  const mainHue = extractMainHue(color.name);

  let color_map = null;
  // Determine which color map to use
  if (option === "trendy") {
    color_map = TRENDY_COLOR_MAP;
  } else if (option === "random") {
    color_map = RANDOM_COLOR_MAP;
  } else if (option === "brighter" || option === "darker") {
    const allColors = getRalClassicColors();
    color_map = mainHue ? filterColorsByHue(mainHue, allColors) : allColors;
  }
  try {
    const userPrompt =
      option === "brighter" || option === "darker"
        ? `You are an experienced interior decorator. Current color: ${JSON.stringify(
            color.hex
          )}. Available colors: ${JSON.stringify(
            color_map
          )}. Select a RAL color that is noticeably ${option}  MUST BE SIMILAR RAL NAME. Return ONLY valid JSON: {"name":"Color Name","ral":"RAL XXXX","hex":"#XXXXXX"}`
        : `You are an experienced interior decorator. Current color:  ${JSON.stringify(
            color.hex
          )}. Available colors: ${JSON.stringify(
            color_map
          )}. Select a ${option} RAL color that is NOT FROM THE RAL COLOR FAMILY OR CONTAIN THE SAME NAME OR COULD BE SIMIMLAR TO THE COLOR from the current color. Return ONLY valid JSON: {"name":"Color Name","ral":"RAL XXXX","hex":"#XXXXXX"}`;

    const response = await moonshot.chat.completions.create({
      model: "kimi-k2-turbo-preview",
      messages: [
        {
          role: "user",
          content: userPrompt,
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0.9,
      max_completion_tokens: 300,
    });

    const colorChoice = JSON.parse(response.choices[0].message.content || "{}");

    if (!colorChoice.hex) {
      throw new Error();
    }

    const colorPrompt = `Apply color: ${colorChoice.hex} to the walls of room`;

    return { colorPrompt, colorChoice };
  } catch (error) {
    console.error("Error getting color from Moonshot:", error);
    throw error;
  }
}
