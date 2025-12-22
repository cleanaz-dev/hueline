import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const admin = await prisma.subdomainUser.findFirst({
    where: {
      role: "SUPER_ADMIN"
    },
    select: {
      name: true,
      email: true,
      imageUrl: true
    }
  });
  
  return NextResponse.json({ admin }); // Wrap it in an object
}