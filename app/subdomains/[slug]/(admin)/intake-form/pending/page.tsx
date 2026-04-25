import { prisma } from "@/lib/prisma";
import { PendingFormTable } from "@/components/admin/form/pending-form-table";

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
          <h1 className="text-primary text-3xl">Pending Form Page</h1>
          <p className="text-muted-foreground text-xs">
            Pending forms listed below
          </p>
        </header>
     
        <PendingFormTable data={pendingForms} />
      </div>
    </div>
  );
}
