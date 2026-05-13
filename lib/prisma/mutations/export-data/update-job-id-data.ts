import { prisma } from "../../config";

interface UpdateJobParams {
  systemTaskId: string;
  status: string;
  downloadUrl?: string;
  completedAt?: Date;
}

export async function UpdateJobIdData(params: UpdateJobParams) {
  const { systemTaskId, status, downloadUrl, completedAt } = params;


  const exportRecord = await prisma.export.update({
    where: { systemTaskId },
    data: {
      status,
      ...(downloadUrl && { downloadUrl }),
      ...(completedAt && { completedAt }),
    },
  });

  return exportRecord;
}