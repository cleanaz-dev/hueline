import { prisma } from "@/lib/prisma";

/**
 * Create a log for an incoming call (initial ingest)
 */
export async function createCallIngestLog(params: {
  bookingDataId: string;
  subdomainId: string;
  callSid: string;
  duration?: string;
  customerName: string;
  customerPhone: string;
  roomType?: string;
}) {
  const {
    bookingDataId,
    subdomainId,
    callSid,
    duration,
    customerName,
    customerPhone,
    roomType,
  } = params;

  try {
    const log = await prisma.logs.create({
      data: {
        bookingDataId,
        subdomainId,
        type: "CALL",
        actor: "CLIENT",
        title: "New Call Received",
        description: `${customerName} called about ${roomType || "their project"}`,
        metadata: {
          callSid,
          duration,
          phone: customerPhone,
          roomType,
          stage: "ingest",
        },
      },
    });

    console.log(`📝 Call ingest log created: ${callSid}`);
    return log;
  } catch (error) {
    console.error("❌ Failed to create call ingest log:", error);
    throw error;
  }
}

/**
 * Create a log for call intelligence analysis
 */
