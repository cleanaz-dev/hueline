import { moonshot } from "../config";

export async function analyzeRoomTextMoonshot(prompt: string) {
  try {
    const response = await moonshot.chat.completions.create({
      model: "moonshot-v1-8k",
      messages: [
        {
          role: "system",
          content: `
        
        You are a Paint Assistant, your job is to extract chunks of conversational text and extract only the actionable parts. Only output data related to a painting quote/estimate. If not related output empty strings.
        
        Please output your reply in the following JSON format:
        
        {
        "category": "Paint Category",
        "action": "Scope Action",
        "item": "Scope Item"
        }
        `,
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      max_completion_tokens: 500,
      temperature: 0.3,
      response_format: { type: "json_object" },
    });

    const content = JSON.parse(response.choices[0].message.content || "");
    
    return content;
  } catch (error) {
    console.error("Error analyzing room text:", error);
    throw error;
  }
}