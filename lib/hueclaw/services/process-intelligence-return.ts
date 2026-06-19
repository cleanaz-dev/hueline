import { SystemTask } from "@/app/generated/prisma";
import { hueClawOutboundCallMetadataSchema } from "@/lib/zod/outbound-calls/hueclaw-outbound-metadata";

export async function processIntelligenceReturn(task: SystemTask, result: any) {
     const metadata = hueClawOutboundCallMetadataSchema.parse(task.metadata);

     const {
        callType,
        customerNumber,
        operatorNumber,
        outboundCallId,
        roomName,
        threadId
     } = metadata

     

    return {
        releaseLock: true,
        threadId: "",
        message: ""
    }
}