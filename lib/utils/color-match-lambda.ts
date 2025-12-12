// lib/utils/color-match-lambda.ts

export async function getColorMatch(
  url: string,
  anchorHex: string,
  targetFamily: string
): Promise<{
  ral: string;
  hex: string;
  name: string;
  reasoning?: string; // Optional: Added since your Lambda returns this now
  family?: string;    // Optional: Added since your Lambda returns this now
}> {
  
  const endpoint = process.env.LAMBDA_COLOR_MATCH_URL;

  if (!endpoint) {
    throw new Error("Missing LAMBDA_COLOR_MATCH_URL environment variable");
  }

  try {
    const resp = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      // Python Lambda expects snake_case keys
      body: JSON.stringify({
        url: url,
        anchor_hex: anchorHex,
        target_family: targetFamily,
      }),
    });

    if (!resp.ok) {
      const errorText = await resp.text();
      throw new Error(`Lambda request failed: ${resp.status} - ${errorText}`);
    }

    const data = await resp.json();

    console.log("Data:", data)

    // Map Python Response (Uppercase keys) to TypeScript Interface (Lowercase keys)
    return {
      ral: data.ral,     
      hex: data.hex,      
      name: data.name,  
      reasoning: data.reasoning,
      family: data.Family
    };

  } catch (error) {
    console.error("❌ getColorMatch Error:", error);
    throw error;
  }
}