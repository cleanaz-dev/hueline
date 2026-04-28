import { prisma } from "@/lib/prisma"
import { columns } from "@/components/admin/prospects/columns"
import { DataTable } from "@/components/admin/prospects/data-table"

export default async function ProspectPage() {
  const prospects = await prisma.demoClient.findMany({
    include: {
      // We get communications sorted by newest first
      communication: {
        orderBy: { createdAt: 'desc' },
        take: 1
      },
      subBookingData: true,
    },
    orderBy: { createdAt: 'desc' }
  })

  return (
    <div className="admin-first-div">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Prospects</h1>
          <p className="text-muted-foreground">
            Manage your demo clients and AI lead nurturing.
          </p>
        </div>
        <div className="bg-primary/10 px-4 py-2 rounded-lg">
           <span className="text-sm font-medium">Total: {prospects.length}</span>
        </div>
      </div>
      
      <DataTable columns={columns} data={prospects} />
    </div>
  )
}