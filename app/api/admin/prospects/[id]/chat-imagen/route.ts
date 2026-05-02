import axios from "axios";
import { NextResponse } from "next/server";

interface Params {
  params: Promise<{ id: string }>;
}

export async function POST(req: Request, { params }: Params) {
  const { id } = await params;

  try {
    const body = await req.json();

    await axios.post(process.env.CHAT_IMAGEN_LAMBDA_URL!, body);

    return NextResponse.json(
      { message: "Success" },
      { status: 200 }
    );
  } catch (error) {
    console.log(error);

    return NextResponse.json(
      { message: "Internal Server Error:", error },
      { status: 500 }
    );
  }
}