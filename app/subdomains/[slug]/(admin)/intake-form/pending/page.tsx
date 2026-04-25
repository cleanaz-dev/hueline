import { prisma } from "@/lib/prisma";
import { PendingFormTable } from "@/components/admin/form/pending-form-table";
import { FileText, Folder } from "lucide-react";

export default async function page() {
  const pendingForms = await prisma.formData.findMany({
    where: {
      client: {
        status: "PENDING_INTAKE",
      },
    },
    include: {
      client: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  console.log("📦 Pending Forms:", pendingForms)

  return (
    <div className="admin-first-div">
      <div className="max-w-8xl mx-auto">
        <header className="mb-4">
          <h1 className="flex gap-2 text-primary text-3xl font-bold tracking-tight items-center"> Pending Form Page</h1>
            <p className="text-gray-500 mt-1">
            Pending forms listed below
          </p>
        </header>
     
        <PendingFormTable data={pendingForms} />
      </div>
    </div>
  );
}
