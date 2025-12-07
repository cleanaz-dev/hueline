"use server";

import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const schema = z.object({
  companyName: z.string().min(2),
  slug: z.string().min(3).regex(/^[a-z0-9-]+$/, "Lowercase, numbers, hyphens only"),
  ownerName: z.string().min(2),
  email: z.email(),
  password: z.string().min(6),
});

export async function createTenant(formData: FormData) {
  const rawData = {
    companyName: formData.get("companyName"),
    slug: formData.get("slug"),
    ownerName: formData.get("ownerName"),
    email: formData.get("email"),
    password: formData.get("password"),
  };

  const validation = schema.safeParse(rawData);
  if (!validation.success) {
    return { error: validation.error.message };
  }

  const data = validation.data;

  try {
    // 1. Check if slug or email taken
    const existingSlug = await prisma.subdomain.findUnique({ where: { slug: data.slug } });
    if (existingSlug) return { error: "Subdomain Slug already taken." };

    const existingUser = await prisma.subdomainUser.findUnique({ where: { email: data.email } });
    if (existingUser) return { error: "User email already exists." };

    // 2. Hash Password
    const hashedPassword = await bcrypt.hash(data.password, 10);

    // 3. Transaction: Create Subdomain AND User
    await prisma.$transaction(async (tx) => {
      const newSubdomain = await tx.subdomain.create({
        data: {
          slug: data.slug,
          companyName: data.companyName,
          active: true,
        },
      });

      await tx.subdomainUser.create({
        data: {
          email: data.email,
          name: data.ownerName,
          passwordHash: hashedPassword,
          role: "account_owner", // The standard role for partners
          subdomainId: newSubdomain.id,
        },
      });
    });

    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    console.error("Create Tenant Error:", error);
    return { error: "Database transaction failed." };
  }
}