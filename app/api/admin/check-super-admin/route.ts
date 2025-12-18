import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const string = "Hello";
    return NextResponse.json(string);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
