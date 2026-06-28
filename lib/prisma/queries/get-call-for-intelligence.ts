import { prisma } from "../config";

export async function getCallForIntelligence(roomName: string) {
  const call = await prisma.call.findFirst({
    where: { roomName },
    select: {
      id: true,
      threadId: true,
      customerId: true,
      subdomainId: true,
      callSid: true,
      subdomain: {
        select: {
          slug: true,
          intelligence: true,
        },
      },
    },
  });

  if (
    !call?.id ||
    !call?.threadId ||
    !call?.customerId ||
    !call?.subdomainId ||
    !call.subdomain?.intelligence ||
    !call?.subdomain.slug
  ) {
    console.warn(
      `⚠️ [getCallForIntelligence] No valid call found for roomName: ${roomName}`,
    );
    return null;
  }

  return {
    callId: call.id,
    threadId: call.threadId,
    customerId: call.customerId,
    subdomainId: call.subdomainId,
    slug: call.subdomain.slug,
    intelligence: call.subdomain.intelligence,
    callSid: call.callSid
  };
}
