import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface Params {
  params: Promise<{ id: string }>;
}

export async function POST(req: Request, { params }: Params) {
  const { id } = await params;

  try {
    // 1. Security Check: Validate the secret header
    const authHeader = req.headers.get("x-webhook-secret");
    if (authHeader !== process.env.LAMBDA_WEBHOOK_SECRET) {
      console.warn(`Unauthorized SMS webhook attempt for prospect: ${id}`);
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // 2. Parse the body from your Lambda response
    const { generatedImageUrl, brand, colorName } = await req.json();

    if (!generatedImageUrl) {
      return NextResponse.json(
        { message: "Missing generatedImageUrl" },
        { status: 400 },
      );
    }

    // 3. Verify the prospect exists
    const demoClient = await prisma.demoClient.findUnique({
      where: { id: id },
    });

    if (!demoClient) {
      return NextResponse.json(
        { message: "Prospect not found" },
        { status: 404 },
      );
    }

    // 4. Save the new message & attachment to the database
    const newMessage = await prisma.clientCommunication.create({
      data: {
        demoClientId: id,
        role: "OPERATOR",
        type: "EMAIL",
        body: `Here is your new mockup featuring the ${brand} palette in ${colorName || "your selected color"}!`,
        mediaAttachments: {
          create: {
            mediaUrl: generatedImageUrl,
            mimeType: "image/jpeg",
            filename: `${brand}-mockup.jpg`,
            size: 0,
            mediaSource: "S3", // ← set this to the correct MediaSource enum value
          },
        },
      },
    });

    // 5. TODO: Trigger your actual SMS logic here (Twilio, Vonage, Plivo, etc.)
    // Example (Twilio):
    // import twilio from "twilio";
    // const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    // await client.messages.create({
    //   body: newMessage.body,
    //   from: process.env.TWILIO_PHONE_NUMBER,
    //   to: demoClient.phone, // Assuming your schema has a phone field
    //   mediaUrl: [generatedImageUrl] // Twilio natively supports sending MMS images via an array of URLs!
    // });

    return NextResponse.json(
      { message: "SMS mockup ingested successfully" },
      { status: 200 },
    );
  } catch (error: any) {
    console.error(`Ingest SMS Error for ${id}:`, error.message || error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 },
    );
  }
}
