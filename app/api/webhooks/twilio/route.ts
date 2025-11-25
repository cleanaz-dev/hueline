import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    console.log("📦 Body:", body)

    return NextResponse.json(
      { message: "Success" },
      { status: 200 }
    )
  } catch (error) {
    console.error("❌ Error:", error)
    return NextResponse.json(
      { message: "Internal Server Error", error },
      { status: 500 }
    )
  }
}