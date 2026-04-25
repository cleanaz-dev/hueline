import AdminClientPage from "@/components/admin/admin-client-page";
import { prisma } from "@/lib/prisma";

export default async function page() {
  const clientData = await prisma.client.findMany({
    include: {
      clientActivities: true,
      subdomain: {
        select: {
          slug: true,
          logo: true,
          logoHeight:true,
          logoWidth: true,
          companyName: true,
          calls: true,
          logs: true,
          bookings: {
            take: 5,
            orderBy: {
              createdAt: "asc"
            }
          }

        }
      },
      _count: true,
    }
  })
  return <AdminClientPage clientData={clientData} />
}