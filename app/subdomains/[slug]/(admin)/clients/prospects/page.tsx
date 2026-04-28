import { prisma } from "@/lib/prisma"

export  default async function Page() {

    const prospects = await prisma.demoClient.findMany({
        include: {
            communication: true,
            subBookingData: true,
        }
    })

    return <div>Prospects Demo Clients {prospects.length}</div>
}