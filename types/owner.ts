// types/owner.ts
import { getOwnerData } from "@/lib/prisma/queries/owner/get-owner-data";

export type OwnerData = NonNullable<Awaited<ReturnType<typeof getOwnerData>>>;