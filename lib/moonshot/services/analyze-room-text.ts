import { moonshot } from "../config";

// 👇 The function you asked for
function enhancedPrompt(dbPrompt: string, dbIntelligence: any) {
  // 1. Get the Core Role from DB
  let systemMessage = dbPrompt || "You are a Paint Assistant.";

  // 2. Append the Rules from DB Intelligence
  if (dbIntelligence?.categories) {
    const rules = Object.entries(dbIntelligence.categories)
      .map(([key, desc]) => `- ${key}: ${desc}`)
      .join("\n");
      
    systemMessage += `\n\n### STRICT CATEGORY RULES\n${rules}`;
  }

  // 3. Append Output Format
  systemMessage += `\n\n### OUTPUT FORMAT
  You must output valid JSON only:
  {
    "category": "PREP, PAINT, REPAIR, or NOTE",
    "action": "The specific work action",
    "item": "The object being worked on"
  }`;

  return systemMessage;
}

export async function analyzeRoomTextMoonshot(
  text: string, 
  dbPrompt: string, 
  dbIntelligence: any
) {
  try {
    // 1. Generate the System Instruction
    const systemContent = enhancedPrompt(dbPrompt, dbIntelligence);

    const response = await moonshot.chat.completions.create({
      model: "moonshot-v1-8k",
      messages: [
        {
          role: "system",
          content: systemContent, // 👈 Uses the enhanced prompt
        },
        {
          role: "user",
          content: text,
        },
      ],
      max_completion_tokens: 500,
      temperature: 0.2,
      response_format: { type: "json_object" },
    });

    const content = JSON.parse(response.choices[0].message.content || "{}");
    
    // Simple validation
    if (!content.category || !content.item) return null;

    return content;
  } catch (error) {
    console.error("Error analyzing room text:", error);
    throw error;
  }
}