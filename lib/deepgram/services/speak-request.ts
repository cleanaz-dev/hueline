import { deepgram } from "../config";

export async function speakRequest(text: string, model = "aura-asteria-en") {
  const response = await deepgram.speak.request(
    { text },
    {
      model,
      encoding: "mp3",
    }
  );

  const stream = await response.getStream();
  if (!stream) throw new Error("Audio generation failed");

  // Read the stream directly using Web Streams API
  const reader = stream.getReader();
  const chunks: Uint8Array[] = [];

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
  }

  // Combine chunks
  const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
  const buffer = new Uint8Array(totalLength);
  let offset = 0;
  for (const chunk of chunks) {
    buffer.set(chunk, offset);
    offset += chunk.length;
  }

  const audioBase64 = Buffer.from(buffer).toString("base64");

  return {
    action: "speak",
    text,
    audio: `data:audio/mp3;base64,${audioBase64}`,
  };
}