import { CallReason, SystemTask } from "@/app/generated/prisma"; 
import { z } from "zod";
import { hueClawOutboundCallMetadataSchema } from "@/lib/zod/outbound-calls/hueclaw-outbound-metadata";
import { intelligenceResultSchema } from "@/lib/zod/intelligence/intelligence-result-schema";
import { prisma } from "@/lib/prisma";

export async function processIntelligenceReturn(task: SystemTask, result: any) {
  // 1. Parse Metadata & Payload
  const metadata = hueClawOutboundCallMetadataSchema.parse(task.metadata);
  const {
    callType,
    customerNumber,
    operatorNumber,
    outboundCallId,
    roomName,
    threadId,
  } = metadata;

  // 2. Parse Results from Lambda
  const parsedData = intelligenceResultSchema.parse(result);
  const { intelligence, transcriptText } = parsedData;

  // 3. Validate Database Relations
  const customer = await prisma.customer.findUnique({
    where: { id: task.customerId! },
  });
  if (!customer) throw new Error(`Customer not found for task ${task.id}`);

  const subdomain = await prisma.subdomain.findUnique({
    where: { id: task.subdomainId },
    select: { id: true, slug: true },
  });
  if (!subdomain) throw new Error(`Subdomain not found for ${task.subdomainId}`);

  console.log(`[Intelligence] 🧠 Processing reasoning for OutboundCall: ${outboundCallId} - Reason: ${intelligence.callReason}`);

  // 4. Update the OutboundCall & Create CallIntelligence Log
  // Using Prisma's nested create to connect the newly generated intelligence directly
//   await prisma.outboundCall.update({
//     where: { id: outboundCallId },
//     data: {
//       outcome: intelligence.callOutcome, // E.g., POSITIVE, NEUTRAL, NEGATIVE
//       intelligence: {
//         create: {
//           transcriptText: transcriptText,
//           callReason: intelligence.callReason as CallReason || "OTHER",
//           callSummary: intelligence.callSummary,
//           callOutcome: intelligence.callOutcome,
//           // If your CallIntelligence model requires these, we provide safe fallbacks
//           projectScope: "UNKNOWN", 
//           estimatedAdditionalValue: 0,
//         }
//       }
//     }
//   });

//   // 5. Update the Chat Thread 
//   // This mimics the "pulse" headline logic from your reference code
//   let pulseString = intelligence.lastInteraction || "Outbound Call Completed";
  
//   if (!intelligence.lastInteraction && intelligence.callReason) {
//      pulseString = intelligence.callReason.replace(/_/g, " ").toLowerCase();
//      pulseString = pulseString.charAt(0).toUpperCase() + pulseString.slice(1);
//   }

//   await prisma.chatThread.update({
//     where: { id: threadId },
//     data: {
//       // Assuming you have fields like this on ChatThread based on your TODO
//       // If your thread uses different field names (e.g. `lastMessage`), adjust accordingly
//       lastInteraction: pulseString,
//       updatedAt: new Date(),
//     }
//   });

  // (Optional) Update CRM/Customer state if needed based on `outcome`
  // if (intelligence.callOutcome === "POSITIVE") { ... }

  return {
    releaseLock: true,
    threadId: threadId,
    message: `Outbound intelligence logged. Outcome: ${intelligence.callOutcome}`,
  };
}