// app/api/subdomain/[slug]/deepgram/token/route.ts

import { NextResponse } from "next/server";
import { createClient } from "@deepgram/sdk";

interface Params {
  params: Promise<{
    slug: string;
  }>;
}

export async function GET(req: Request, { params }: Params) {
  // 1. Initialize Client
  // Ensure you have DEEPGRAM_API_KEY in your .env.local file
  const deepgram = createClient(process.env.DEEPGRAM_API_KEY!);

  const { slug } = await params;

  if (!slug) {
    return NextResponse.json({ message: "Invalid Request" }, { status: 400 });
  }

  try {
    // 2. Fetch Projects
    const projectResponse = await deepgram.manage.getProjects();

    // FIX: Check if result exists before accessing it
    if (!projectResponse.result) {
      throw new Error("Could not fetch Deepgram projects");
    }

    // Safely access the first project ID
    const projectId = projectResponse.result.projects[0].project_id;

    // 3. Create Temporary Key
    const keyResponse = await deepgram.manage.createProjectKey(projectId, {
      comment: "Live Room Client",
      scopes: ["usage:write"],
      time_to_live_in_seconds: 60, // Key dies in 60 seconds (enough time to connect)
    });

    // FIX: Check if result exists before accessing it
    if (!keyResponse.result) {
      throw new Error("Could not create Deepgram key");
    }

    // 4. Return the Key
    return NextResponse.json({ key: keyResponse.result.key });
    
  } catch (error) {
    console.error("Deepgram Token Error:", error);
    return NextResponse.json(
      { error: "Deepgram Token Error" },
      { status: 500 }
    );
  }
}