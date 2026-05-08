import { prisma } from "@/lib/prisma";
import { columns } from "@/components/admin/prospects/columns";
import { DataTable } from "@/components/admin/prospects/data-table";


export default async function ProspectPage() {
  
  return (
    <div className="admin-first-div">
     

      <DataTable columns={columns} />
    </div>
  );
}