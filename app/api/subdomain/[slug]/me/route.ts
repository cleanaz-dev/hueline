import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

interface Params {
  params: Promise<{
    slug: string;
  }>;
}

export async function GET(req: Request, { params }: Params) {
  const { slug } = await params;
  const session = await getServerSession(authOptions);
  const user = session?.user;

  try {
    if (!user || !user.email || !slug) {
      return NextResponse.json({ message: "Invalid Request" }, { status: 400 });
    }

    const isUserValid = await prisma.subdomainUser.findFirst({
      where: {
        email: user.email,
        subdomain: {
          slug,
        },
      },
    });

    if (!isUserValid)
      return NextResponse.json({ message: "Not Authorized" }, { status: 401 });

    return NextResponse.json({ me: isUserValid });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Error fetching user details" },
      { status: 500 },
    );
  }
}
