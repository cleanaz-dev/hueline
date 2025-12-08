import { prisma } from "@/lib/prisma";

interface AccessParams {
  email: string;
  accessType: string;
  pin: string;
}

export async function updateSharedAccess(id: string, access: AccessParams) {
  await prisma.sharedAccess.update({
    where: { id },
    data: {
      email: access.email,
      accessType: access.accessType,
      pin: access.pin,
    },
  });
}
