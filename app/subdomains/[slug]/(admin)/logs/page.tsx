import AdminLogsPage from "@/components/admin/admin-logs-page";
import { verifySuperAdmin } from "@/lib/auth";

export default async function page() {
  await verifySuperAdmin();
  return <AdminLogsPage />;
}
