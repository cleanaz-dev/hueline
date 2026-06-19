import { SystemTask } from "@/app/generated/prisma";

export async function processIntelligenceReturn(task: SystemTask, result: any) {
    

    return {
        releaseLock: true,
        threadId: "",
        message: ""
    }
}