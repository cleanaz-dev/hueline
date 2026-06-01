import { prisma } from "@/lib/prisma";

export async function isOperatorValid(userEmail: string, slug: string) {
  try {
    const operator = await prisma.subdomainUser.findFirst({
      where: {
        email: userEmail,
        subdomain: {
          slug: slug,
        },
      },
    });

    return !!operator; // Returns true if operator exists, false otherwise
  } catch (error) {
    console.error("Error validating operator:", error);
    return false; // In case of error, treat as invalid operator
  }
}
