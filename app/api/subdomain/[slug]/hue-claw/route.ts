import { NextResponse } from "next/server";

interface Params {
  params: Promise<{
    slug: string;
  }>;
}

export async function POST(req: Request, { params }: Params) {
  const { slug } = await params;

  const body = await req.json();

  console.log(slug, body);

  return NextResponse.json({ message: "ok" });
}
