import { prisma } from "@/lib/prisma";
import { columns } from "@/components/admin/prospects/columns";
import { DataTable } from "@/components/admin/prospects/data-table";
import { MOCK_PROSPECTS } from "@/components/admin/prospects/mock-data";

export default async function ProspectPage() {
  // Toggle this for testing vs production
  const isDev = process.env.NODE_ENV === 'development';
  
  const realProspects = await prisma.demoClient.findMany({
    include: {
      communication: { orderBy: { createdAt: 'desc' } },
      subBookingData: true,
    },
    orderBy: { createdAt: 'desc' }
  });

  const data = isDev ? MOCK_PROSPECTS : realProspects;

  return (
    <div className="admin-first-div">
      <header>
        <h1 className="text-4xl font-extrabold tracking-tight">Lead Command Center</h1>
        <p className="text-muted-foreground mt-2">
          Monitor AI conversations and intervene in real-time.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="p-4 rounded-xl border bg-card shadow-sm">
          <p className="text-sm font-medium text-muted-foreground">Active Leads</p>
          <p className="text-2xl font-bold">{data.length}</p>
        </div>
        <div className="p-4 rounded-xl border bg-card shadow-sm">
          <p className="text-sm font-medium text-muted-foreground">Booked Today</p>
          <p className="text-2xl font-bold text-green-600">
            {data.filter(p => p.status === 'BOOKED').length}
          </p>
        </div>
      </div>

      <DataTable columns={columns} data={data} />
    </div>
  );
}