import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { extractEmail } from "./config";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      fromAddress,
      toAddress,
      summary,
      subject,
      hasAttachment,
      sender,
      size,
    } = body;

    const email = extractEmail(toAddress);

    const isDomain = await prisma.subdomainUser.findFirst({
      where: {
        subdomain: {
            slug: "admin"
        },
        email: {
          contains: email,
        },
      },
      select: {
        id: true,
        subdomainId: true,
        email: true,
      }
    });

    if (!isDomain) {
      console.log("Not Admin Domain");
      return NextResponse.json({ message: "Invalid Request" }, { status: 400 });
    }

    
    console.log("Zoho Mail Webhook:", body);
    return NextResponse.json({ message: "Success" }, { status: 200 });
  } catch (error) {
    console.warn("Webhook Error:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 },
    );
  }
}
