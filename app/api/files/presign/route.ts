import { getPresignedUrl } from "@/lib/aws/s3/services/get-presigned-url";
import { NextResponse } from "next/server";



export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const key = searchParams.get("key");

    if (!key) {
      return NextResponse.json({ error: "Missing file key" }, { status: 400 });
    }

    const url = await getPresignedUrl(key);
    console.log("Presigned URL generated:", url);



    // Instantly redirect the browser's image tag to the fresh AWS URL
    return NextResponse.json(url);

  } catch (error) {
    console.error("Presign error:", error);
    return new NextResponse("File not found", { status: 404 });
  }
}