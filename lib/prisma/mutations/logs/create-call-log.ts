import { prisma } from "@/lib/prisma";

/**
 * Create a log for an incoming call from an existing customer
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
        title: "Follow-up Call Received",
        description: `${customerName} called back${roomType ? ` regarding ${roomType}` : ""}`,
        metadata: {
          callSid,
          duration,
          phone: customerPhone,
          roomType,
          stage: "existing",
        },
      },
    });
    
    console.log(`📝 Follow-up call log created: ${callSid}`);
    return log;
  } catch (error) {
    console.error("❌ Failed to create call ingest log:", error);
    throw error;
  }
}