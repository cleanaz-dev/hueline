import { deepgram } from "../config";

export async function readSummary(text: string, model?: string) {
  const response = await fetch(
    `${deepgram.apiUrl}?model=${model || deepgram.defaultModel}`,
    {
      method: "POST",
      headers: {
        Authorization: `Token ${deepgram.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text }),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Deepgram TTS failed: ${error}`);
  }

  return response;
}