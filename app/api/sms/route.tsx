import { NextResponse } from "next/server";
import { uploadToCloudinary } from "@/lib/cloudinary";
import { pushImageUrl } from "@/lib/redis";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const from = formData.get("From") as string;
    const numMediaEntry = formData.get("NumMedia");
    const mediaCount = parseInt((numMediaEntry as string) || "0");

    for (let i = 0; i < mediaCount; i++) {
      const mediaUrlEntry = formData.get(`MediaUrl${i}`);
      if (!mediaUrlEntry || typeof mediaUrlEntry !== "string") continue;

      const secureUrl = await uploadToCloudinary(mediaUrlEntry, `decor/${from}`);
      await pushImageUrl(from, secureUrl);
    }
  } catch (e) {
    console.error("SMS webhook error:", e);
  }

  return new NextResponse(
    `<?xml version="1.0" encoding="UTF-8"?><Response></Response>`,
    {
      status: 200,
      headers: { "Content-Type": "application/xml" },
    }
  );
}

export async function GET() {
  try {
    console.log("Hello!");
    return NextResponse.json({ message: "Hello!" }, { status: 200 });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
