import { prisma } from "@/lib/prisma";
import { moonshot, twilioClient, SMS_PROMPTS } from "./config";

type PromptType = keyof typeof SMS_PROMPTS;

interface SendDynamicSmsProps {
  to: string;
  recipientName: string;
  promptType: PromptType;
  context: string;
  demoClientId: string;
  history?: { role: "user" | "assistant"; content: string }[];
}

export async function sendDynamicSms({
  to,
  recipientName,
  promptType,
  context,
  demoClientId,
  history = [],
}: SendDynamicSmsProps) {
  
  const promptConfig = SMS_PROMPTS[promptType];

  try {
    const response = await moonshot.chat.completions.create({
      model: "kimi-k2.6",
      messages: [
        { role: "system", content: promptConfig.system },
        ...history,
        { role: "user", content: promptConfig.user(recipientName, context) },
      ],
      temperature: 0.3,
      max_tokens: 150, // Safety to keep SMS short
    });

    const body = response.choices[0].message.content?.trim() || "";

    const message = await twilioClient.messages.create({
      to,
      from: process.env.TWILIO_PHONE_NUMBER,
      body,
    });

    await prisma.clientCommunication.create({
      data: {
        body,
        role: "AI",
        type: "SMS",
        demoClientId,
      },
    });

    return message;
  } catch (error) {
    console.error(`Error in SMS [${promptType}]:`, error);
    throw error;
  }
}