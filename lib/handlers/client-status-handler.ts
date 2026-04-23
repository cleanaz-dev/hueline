import { prisma } from "../prisma";

export async function markFeeAsPaid(email: string) {
  const client = await prisma.formData.findUnique({
    where: { email },
  });

  if (!client) {
    throw new Error("Client not found");
  }

  // Update the client stage
  await prisma.client.update({
    where: { email },
    data: {
      status: "FEE_PAID",
    },
  });


  return { success: true, message: "Fee marked as paid" };
}

export async function markWorkCompleted(email: string) {
  const client = await prisma.formData.findUnique({
    where: { email },
  });

  if (!client) {
    throw new Error("Client not found");
  }

  await prisma.client.update({
    where: { email },
    data: {
      status: "WORK_COMPLETED",
    },
  });

  return { success: true, message: "Work marked as completed" };
}

export async function markDemoApproved(email: string) {
  const client = await prisma.formData.findUnique({
    where: { email },
  });

  if (!client) {
    throw new Error("Client not found");
  }

  await prisma.client.update({
    where: { email },
    data: {
      status: "DEMO_APPROVED",
    },
  });

  return { success: true, message: "Demo marked as approved" };
}

export async function markJobCompleted(email: string) {
  const client = await prisma.formData.findUnique({
    where: { email },
  });

  if (!client) {
    throw new Error("Client not found");
  }

  await prisma.client.update({
    where: { email },
    data: {
      status: "JOB_COMPLETED",
    },
  });


  return { success: true, message: "Job marked as completed" };
}