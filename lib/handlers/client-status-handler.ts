import { prisma } from "../prisma";

export async function markFeeAsPaid(email: string) {
  const client = await prisma.formData.findUnique({
    where: { email },
  });

  if (!client) {
    throw new Error("Client not found");
  }

  // Update the client stage
  await prisma.formData.update({
    where: { email },
    data: {
      stage: "FEE_PAID",
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

export async function markWorkCompleted(email: string) {
  const client = await prisma.formData.findUnique({
    where: { email },
  });

  if (!client) {
    throw new Error("Client not found");
  }

  await prisma.formData.update({
    where: { email },
    data: {
      stage: "WORK_COMPLETED",
    },
  });

  await prisma.formActivity.create({
    data: {
      formId: client.id,
      action: "WORK_COMPLETED",
      details: `Initial work completed`,
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

  await prisma.formData.update({
    where: { email },
    data: {
      stage: "DEMO_APPROVED",
    },
  });

  await prisma.formActivity.create({
    data: {
      formId: client.id,
      action: "DEMO_APPROVED",
      details: `Client approved the demo`,
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

  await prisma.formData.update({
    where: { email },
    data: {
      stage: "JOB_COMPLETED",
    },
  });

  await prisma.formActivity.create({
    data: {
      formId: client.id,
      action: "JOB_COMPLETED",
      details: `Project completed successfully`,
    },
  });

  return { success: true, message: "Job marked as completed" };
}