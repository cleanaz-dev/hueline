import { prisma } from "@/lib/prisma";



export async function createRoomLog(params: {
  subdomainId: string;
  roomKey: string;     // The public ID (e.g. from URL)
  dbRoomId: string;    // The internal database ID
  actorEmail: string;  // The user who created it
  clientName?: string;
  bookingDataId?: string | null; // Optional link to a project
}) {
  const { 
    subdomainId, 
    roomKey, 
    dbRoomId, 
    actorEmail, 
    clientName, 
    bookingDataId 
  } = params;

  try {
    await prisma.logs.create({
      data: {
        bookingDataId: bookingDataId || undefined,
        subdomainId,
        type: "ROOM",
        actor: "PAINTER",
        title: "Room Created",
        description: `Virtual Room (${roomKey}) started by ${actorEmail}${clientName ? ` for ${clientName}` : ""}.`,
        metadata: {
          action: "CREATE_ROOM",
          roomKey,
          dbRoomId,
          createdBy: actorEmail,
          clientName,
        },
      },
    });

    console.log(`📝 Room Creation log created: ${roomKey}`);
  } catch (error) {
    console.error("❌ Failed to create room log:", error);
  }
}