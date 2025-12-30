import { prisma } from "@/lib/prisma";

/**
 * Create a log for an incoming call from an existing customer
 */
export async function createCallIngestLog(params: {
  bookingDataId?: string | null;
  subdomainId: string;
  callSid: string;
  from?: string;
  duration?: string;
}) {
  const { bookingDataId, subdomainId, callSid, from, duration } = params;

  try {
    const log = await prisma.logs.create({
      data: {
        bookingDataId: bookingDataId || undefined, // Handle null gracefully
        subdomainId,
        type: "CALL",
        actor: "SYSTEM", // System is recording the call
        title: "Call Received",
        description: `Incoming call${from ? ` from ${from}` : ""}. Duration: ${
          duration || "0"
        }s. Sending to AI for analysis...`,
        metadata: {
          callSid,
          stage: "ingestion",
          duration,
          from,
        },
      },
    });
    console.log(`📝 Call ingestion log created: ${callSid}`);
    return log;
  } catch (error) {
    console.error("❌ Failed to create ingestion log:", error);
  }
}
