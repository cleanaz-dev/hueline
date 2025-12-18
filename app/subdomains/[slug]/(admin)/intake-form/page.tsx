import ClientFormPage from "@/components/admin/form/client-form-page";
import { verifySuperAdmin } from "@/lib/auth";

export default async function page() {
  await verifySuperAdmin();
  
  return (
    <>
      <ClientFormPage />
    </>
  )
}