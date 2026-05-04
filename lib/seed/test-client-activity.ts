import { prisma } from "../prisma";

async function getClientActivity() {
    const logs = await prisma.logs.findMany({
        where: {
            type: {
                not: "ROOM"
            }
        },
        take:10,
        
    })

    console.log("Logs:", logs)

    return
}
getClientActivity()