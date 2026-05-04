import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { MOCK_PROSPECTS } from "@/components/admin/prospects/mock-data";

// 👇 Update this import path to wherever your function lives
import { aiChatSuggestion } from "@/lib/moonshot";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
    try {
        const { id } = await params;

        if (process.env.NODE_ENV === "development") {
            const mock = MOCK_PROSPECTS.find((p) => p.id === id);
        
            if (mock) {
                // 1. Format the last 10 communications for the AI Payload
                const recentMessages = mock.communication
                  .slice(-10) 
                  .map((msg: any) => ({
                      role: msg.role,
                      type: msg.type,
                      body: msg.body,
                  }));

                // 2. Call your AI function
                const aiResult = await aiChatSuggestion({
                    clientName: mock.name,        // Use whatever field your mock data has
                    clientStatus: mock.status,    // Use whatever field your mock data has
                    recentMessages: recentMessages
                });

                // 3. Return the response directly to the frontend
                console.log("Suggestion:", aiResult)
                return NextResponse.json(aiResult);
            } else {
                return NextResponse.json(
                    { error: "Prospect not found in mock data" }, 
                    { status: 404 }
                );
            }
        }

        // TODO: Production logic (Prisma) goes here later
        // const realClient = await prisma.client.findUnique({...})

        return NextResponse.json({ error: "Production not implemented yet" }, { status: 501 });
        
    } catch (error) {
        console.error("AI Suggestion Route Error:", error);
        return NextResponse.json(
            { error: "Failed to generate AI suggestion" }, 
            { status: 500 }
        );
    }
}