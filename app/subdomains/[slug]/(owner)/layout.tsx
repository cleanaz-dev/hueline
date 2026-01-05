// app/(owner)/layout.tsx
import { notFound } from "next/navigation";
import { headers } from "next/headers";
import { OwnerProvider } from "@/context/owner-context";
import { getOwnerData } from "@/lib/prisma/queries/owner/get-owner-data";

export default async function OwnerRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // 1. Resolve Subdomain
  const headersList = await headers();
  const host = headersList.get("host") || "";
  const slug = host.split(".")[0]; 

  // 2. Fetch Data
  const subdomain = await getOwnerData(slug);
  if (!subdomain) return notFound();

  // 3. Pass Data ONLY. No visual sidebar here.
  return (
    <OwnerProvider value={{ subdomain }}>
      {children}
    </OwnerProvider>
  );
}