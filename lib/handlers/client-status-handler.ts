import { prisma } from "../prisma";


export async function sendSubscriptionLink(email: string) {
  const client = await prisma.formData.findUnique({
    where: { email },
  });

  if (!client) {
    throw new Error("Client not found");
  }

  // Update the client
  await prisma.formData.update({
    where: { email },
    data: {
      subLinkSent: true,
    },
  });

  // Create activity record
  await prisma.formActivity.create({
    data: {
      formId: client.id,
      action: "SUB_LINK_SENT",
      details: `Subscription link sent to ${email}`,
    },
  });

  return { success: true, message: "Subscription link sent" };
}

export async function resendSubscriptionLink(email: string) {
  const client = await prisma.formData.findUnique({
    where: { email },
  });

  if (!client) {
    throw new Error("Client not found");
  }

  // Create activity record for resend
  await prisma.formActivity.create({
    data: {
      formId: client.id,
      action: "SUB_LINK_RESENT",
      details: `Subscription link resent to ${email}`,
    },
  });

  return { success: true, message: "Subscription link resent" };
}

export async function markAsSubscribed(email: string) {
  const client = await prisma.formData.findUnique({
    where: { email },
  });

  if (!client) {
    throw new Error("Client not found");
  }

  // Update the client
  await prisma.formData.update({
    where: { email },
    data: {
      subscribed: true,
    },
  });

  // Create activity record
  await prisma.formActivity.create({
    data: {
      formId: client.id,
      action: "SUBSCRIBED",
      details: `Client activated subscription`,
    },
  });

  return { success: true, message: "Client marked as subscribed" };
}

export async function markFeeAsPaid(email: string) {
  const client = await prisma.formData.findUnique({
    where: { email },
  });

  if (!client) {
    throw new Error("Client not found");
  }

  // Update the client
  await prisma.formData.update({
    where: { email },
    data: {
      feePaid: true,
    },
  });

  // Create activity record
  await prisma.formActivity.create({
    data: {
      formId: client.id,
      action: "FEE_PAID",
      details: `Setup fee payment received`,
    },
  });

  return { success: true, message: "Fee marked as paid" };
}

export async function getClientWithActivities(email: string) {
  const client = await prisma.formData.findUnique({
    where: { email },
    include: {
      activities: {
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!client) {
    throw new Error("Client not found");
  }

  return client;
}