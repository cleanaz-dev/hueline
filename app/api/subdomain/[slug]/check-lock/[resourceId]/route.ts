import { Redis } from "@upstash/redis";
import { NextResponse } from "next/server";

const redis = Redis.fromEnv();

interface Params {
  params: Promise<{
    resourceId: string;
    slug: string
  }>;
}

export async function GET(req: Request, { params }: Params) {
  const { resourceId, slug } = await params;
  const { searchParams } = new URL(req.url);
  const lockContext = searchParams.get("context") ?? "IMAGEN";

  const lock = await redis.get(`lock:${lockContext}:${resourceId}`);

  return NextResponse.json({ isGenerating: !!lock });
}