import { prisma } from "@/lib/prisma";
import { createCallIntelligenceLog } from "@/lib/prisma/mutations/logs/create-intelligence-log";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    // 1. SECURITY CHECK
    const headersList = await headers();
    const apiKey = headersList.get("x-api-key");

    if (apiKey !== process.env.INTERNAL_API_KEY) {
      console.warn("⛔ Unauthorized webhook attempt");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. PARSE THE DATA
    const body = await req.json();
  
    console.log("body:", body)
    

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("❌ Webhook Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}