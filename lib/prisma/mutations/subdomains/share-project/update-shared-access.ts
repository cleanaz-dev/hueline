import { AccessType } from "@/app/generated/prisma";
import { prisma } from "@/lib/prisma";

interface AccessParams {
  email: string;
  accessType: AccessType;
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
