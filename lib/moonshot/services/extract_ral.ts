import {  getRalHexName } from "@/lib/utils/server";
import { moonshot } from "../config";

interface RALColor {
  ral: string;
  name: string;
  hex: string;
}

export const extractRAL = async (
  imageUrl: string
): Promise<RALColor[]> => {
  
  // 1. Get RAL colors database
  const colors = getRalHexName();
  
  try {
    // 2. Fetch and convert image to base64
    const imageResponse = await fetch(imageUrl);
    if (!imageResponse.ok) {
      throw new Error(`Failed to fetch image: ${imageResponse.statusText}`);
    }
    
    const arrayBuffer = await imageResponse.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString('base64');
    
    // 3. Call Moonshot Vision API
    const response = await moonshot.chat.completions.create({
      model: "moonshot-v1-8k-vision-preview",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `You are Kimi, an AI assistant created by Moonshot AI. Your job is to be a professional RAL Classic colour consultant. 
Analyze this image and identify the wall paint colour that is visible. 
Choose the closest RAL Classic colour 
Use the RAL Classic database below to select the adjusted match.

RAL Classic Database:
${colors}

Return ONLY a JSON array with ONE adjusted wall color:
[{"ral":"RAL XXXX","name":"Color Name","hex":"#HEXCODE"}]`
            },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${base64}`
              }
            }
          ]
        }
      ],
      max_tokens: 500,
      temperature: 0.3
    });

    // 4. Parse response
    let raw = response.choices[0]?.message?.content?.trim() || "[]";
    
    // Remove markdown code blocks if present
    if (raw.startsWith("```json")) {
      raw = raw.replace(/```json|```/g, "").trim();
    }
    
    const extractedColors: RALColor[] = JSON.parse(raw);
    console.log("🎁 Adjusted RAL colour identified:", extractedColors);
    
    return extractedColors;
    
  } catch (error) {
    console.error("❌ Failed to extract RAL color:", error);
    return [];
  }
};