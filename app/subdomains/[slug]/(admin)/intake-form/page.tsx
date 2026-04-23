import ClientFormPage from "@/components/admin/form/client-form-page";
import { verifySuperAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function page() {
  // 1. Secure the page
  await verifySuperAdmin();
  
  // 2. Count exactly how many forms are waiting in the "Pending" state
  const pendingCount = await prisma.formData.count({
    where: {
      client: {
        status: "PENDING_INTAKE"
      }
    }
  });
  
  return (
    <>
      <ClientFormPage pendingCount={pendingCount} />
    </>
  );
}