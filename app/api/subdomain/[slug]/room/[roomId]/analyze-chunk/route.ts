// api/subdomain/[slug]/room/[roomId]/analyze-chunk/route.ts
import { analyzeRoomTextMoonshot } from "@/lib/moonshot/services/analyze-room-text";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getRoomIntelligence, setRoomIntelligence } from "@/lib/redis";

interface Params {
  params: Promise<{
    slug: string;
    roomId: string;
  }>;
}

export async function POST(req: Request, { params }: Params) {
  const { slug, roomId } = await params;

  if (!slug || !roomId)
    return NextResponse.json({ message: "Invalid Parameters" }, { status: 400 });

  try {
    const { text } = await req.json();

    if (!text)
      return NextResponse.json({ message: "Missing Text" }, { status: 400 });

    let dbPrompt = "";
    let dbIntelligence = {};

    // 1. TRY REDIS (HOT READ)
    const cachedConfig = await getRoomIntelligence(slug);

    if (cachedConfig) {
      dbPrompt = cachedConfig.prompt;
      dbIntelligence = cachedConfig.intelligence;
    } else {
      // 2. DB FALLBACK (COLD READ)
      console.log("❄️ Redis Miss: Fetching Intelligence from DB");
      
      const subdomain = await prisma.subdomain.findUnique({
        where: { slug },
        include: { roomIntelligence: true }
      });

      // Default values to prevent crashes
      dbPrompt = subdomain?.roomIntelligence?.prompt || "You are a Paint Assistant.";
      dbIntelligence = subdomain?.roomIntelligence?.intelligence || {};

      await setRoomIntelligence(slug, {
        prompt: dbPrompt,
        intelligence: dbIntelligence as any 
      });
    }

    // 4. PASS TO SERVICE
    const response = await analyzeRoomTextMoonshot(text, dbPrompt, dbIntelligence);

    if (response) return NextResponse.json(response);
    
    return NextResponse.json({});

  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Error Validating Text" },
      { status: 500 }
    );
  }
}