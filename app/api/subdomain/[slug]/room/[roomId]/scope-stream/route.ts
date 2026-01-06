// app/api/subdomain/[slug]/room/[roomId]/scope-stream/route.ts
import { createClient } from 'redis';
import { NextResponse } from "next/server";

interface Params {
  params: Promise<{
    slug: string;
    roomId: string;
  }>;
}

export async function GET(req: Request, { params }: Params) {
  try {
    const { slug, roomId } = await params;

    if (!slug || !roomId)
      return NextResponse.json(
        { message: "Invalid Parameters" },
        { status: 400 }
      );

    const encoder = new TextEncoder();
    
    const stream = new ReadableStream({
      async start(controller) {
        const subscriber = createClient({
          url: process.env.REDIS_URL || 'redis://localhost:6379'
        });
        
        await subscriber.connect();
        console.log(`[Stream] Connected: room ${roomId}`);
        
        // Subscribe to BOTH channels
        await subscriber.subscribe(`room:${roomId}:scopes`, (message) => {
          console.log(`[Stream] Scope:`, message);
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ type: 'scope', data: JSON.parse(message) })}\n\n`)
          );
        });
        
        await subscriber.subscribe(`room:${roomId}:events`, (message) => {
          console.log(`[Stream] Event:`, message);
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ type: 'event', data: JSON.parse(message) })}\n\n`)
          );
        });
        
        // Cleanup on disconnect
        req.signal.addEventListener('abort', async () => {
          console.log(`[Stream] Disconnected: room ${roomId}`);
          await subscriber.quit();
          controller.close();
        });
      }
    });
    
    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      }
    });

  } catch (error) {
    console.error('[Stream Error]', error);
    return NextResponse.json({ message: "Stream error" }, { status: 500 });
  }
}