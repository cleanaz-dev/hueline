//lib/query/index.ts

import { prisma } from "../prisma";

export async function getClientByEmail(email: string) {
  return await prisma.formData.findUniqueOrThrow({
    where: {
      email: email  // or using ES6 shorthand: { email }
    }
  });
}