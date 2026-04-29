import { prisma } from "@/lib/prisma";
import { sendDefaultSMS } from "@/lib/twilio/sms-default";
import { NextResponse } from "next/server";

interface Params {
  params: Promise<{
    id: string;
  }>;
}

export async function POST(req: Request, { params }: Params) {
  const { id } = await params;

  try {
    const { message } = await req.json();
    console.log("Test SMS SEND FROM PROSPECTS:", message);
    return NextResponse.json({ message: "Success" }, { status: 200 });
    // const demoClient = await prisma.demoClient.findUnique({
    //   where: { id },
    // });

    // if (!demoClient) {
    //   return NextResponse.json({ message: "Invalid Request" }, { status: 400 });
    // }

    // const { message } = await req.json();

    // if (!message) {
    //   return NextResponse.json(
    //     { message: "Invalid Request - message required" },
    //     { status: 400 },
    //   );
    // }

    // const clientPhone = demoClient.phone;
    // const clientName = demoClient.name || "";

    // if (!clientPhone) {
    //   return NextResponse.json(
    //     { message: "Client has no phone number" },
    //     { status: 400 },
    //   );
    // }

    // try {
    //   await sendDefaultSMS({
    //     to: clientPhone,
    //     recipientName: clientName,
    //     body: message,
    //     demoClientId: id,
    //   });

    //   return NextResponse.json(
    //     { message: "SMS sent successfully" },
    //     { status: 200 },
    //   );
    // } catch (smsError) {
    //   console.error("Error sending SMS:", smsError);
    //   return NextResponse.json(
    //     { message: "Failed to send SMS" },
    //     { status: 500 },
    //   );
    // }
  } catch (error) {
    console.error("Error in POST request:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}
