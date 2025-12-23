import AdminIntelligencePage from "@/components/admin/admin-intelligence-page";
import { verifySuperAdmin } from "@/lib/auth";

export default async function Page() {
  await verifySuperAdmin();
  return <AdminIntelligencePage />
}