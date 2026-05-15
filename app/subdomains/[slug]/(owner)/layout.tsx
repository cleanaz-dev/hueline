// app/(owner)/layout.tsx
import { notFound } from "next/navigation";
import { headers } from "next/headers";
import { OwnerProvider } from "@/context/owner-context";
import { getOwnerData } from "@/lib/prisma/queries/owner/get-owner-data";
import { GlobalOwnerChatWidget } from "@/components/admin/prospects/global-owner-chat-widget";
import AddCustomerDialog from "@/components/owner/customers/add-customer-dialog";
import InviteTeamDialog from "@/components/owner/team/invite-team-dialog";
import ReportTaskDialog from "@/components/owner/system-tasks/report-task-dialog";
import { DesignProvider } from "@/context/design-studio-context";

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
    <OwnerProvider subdomain={subdomain}>
      <DesignProvider>
        {children}
        <GlobalOwnerChatWidget />
        <AddCustomerDialog />
        <InviteTeamDialog />
        <ReportTaskDialog />
      </DesignProvider>
    </OwnerProvider>
  );
}
