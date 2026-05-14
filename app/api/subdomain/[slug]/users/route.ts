import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { MOCK_USERS } from "@/lib/mock-config/mock-users";

interface Params {
  params: Promise<{
    slug: string;
  }>;
}

export async function GET(req: Request, { params }: Params) {
  const { slug } = await params;

  let users;
  if (process.env.NODE_ENV === "development") {
    users = MOCK_USERS.filter((user) => user.subdomain.slug === slug);
  } else {
    users = await prisma.subdomainUser.findMany({
      where: { subdomain: { slug } },
    });
  }

  console.log("Users:", users);

  return NextResponse.json({ users: users });
}
