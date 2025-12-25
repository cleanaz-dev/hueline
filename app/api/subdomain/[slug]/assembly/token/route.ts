import { NextResponse } from "next/server";
interface Params {
  params: Promise<{
    slug: string;
  }>;
}

export async function POST(req: Request, { params }: Params) {
  const { slug } = await params;

  if (!slug)
    return NextResponse.json({ message: "Invalid Request" }, { status: 400 });
  try {
    const response = await fetch(
      "https://api.assemblyai.com/v2/realtime/token",
      {
        method: "POST",
        headers: {
          authorization: process.env.ASSEMBLYAI_AI_KEY!, // Add this to your .env
          "content-type": "application/json",
        },
        body: JSON.stringify({ expires_in: 3600 }), // Token valid for 1 hour
      }
    );

    const data = await response.json();

    if (data.error) {
      return NextResponse.json({ error: data.error }, { status: 500 });
    }

    return NextResponse.json({ token: data.token });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to generate token" },
      { status: 500 }
    );
  }
}
