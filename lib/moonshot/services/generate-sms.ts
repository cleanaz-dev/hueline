import { moonshot } from "../config";

interface GenerateSMSProps {
    type: string;            // e.g., "Booking Confirmation", "24hr Follow up"
    recipientName: string;   // e.g., "John"
    context?: string;        // e.g., "Meeting is tomorrow at 2 PM PST" (Optional)
}

export async function GenerateSMS({ type, recipientName, context = "" }: GenerateSMSProps) {
    try {
        const response = await moonshot.chat.completions.create({
            model: "kimi-k2.6", 
            messages:[
                {
                    role: "system",
                    content: "You are an SMS/Marketing Agent for Hue-Line Painter Voice AI. Keep responses under 160 characters. Be friendly, professional, and optimized for SMS."
                },
                {
                    role: "user",
                    content: `Write a ${type} SMS for ${recipientName}. ${context ? `Additional context: ${context}` : ''}`
                }
            ],
            temperature: 0.3, // Low temperature keeps it professional and less "creative/weird"
        });

        const smsContent = response.choices[0].message.content;
        
        return smsContent;

    } catch (error) {
        console.error("Error generating SMS with Moonshot:", error);
        throw error;
    }
}