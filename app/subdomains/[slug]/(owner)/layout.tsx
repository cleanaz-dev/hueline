// app/(owner)/layout.tsx
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { OwnerProvider } from "@/context/owner-context";
import SubdomainNav from "@/components/subdomains/layout/subdomain-nav";

interface Params {
  params: Promise<{
    slug: string;
  }>;
}

export default async function OwnerRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // A. Resolve Subdomain from Host Header (middleware logic assumption)
  const headersList = await headers();
  const host = headersList.get("host") || "";
  const slug = host.split(".")[0]; // e.g., "demo" from "demo.hue-line.com"

  // B. Fetch Data (Single DB Query for everything)
  const subdomain = await prisma.subdomain.findUnique({
    where: { slug },
    include: {
      callFlows: true,
      intelligence: true,
      logs: true,
      users: true,
      calls: {
        include: {
          intelligence: true,
          bookingData: {
            include: {
              mockups: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc", // Most recent calls first
        },
      },
    },
  });

  if (!subdomain) return <div>Subdomain not found</div>;

  // C. Auth Check (Optional: ensure user owns this subdomain)
  // const session = await getSession();
  // if (subdomain.userId !== session.user.id) redirect("/login");

  // D. Pass Data to Client Context
  return (
    <OwnerProvider value={{ subdomain }}>
      <SubdomainNav data={subdomain} miniNav={false} />
      <div className="min-h-screen bg-blue-100">{children}</div>
    </OwnerProvider>
  );
}
