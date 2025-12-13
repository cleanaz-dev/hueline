import { prisma } from "../../config";

interface UpdateJobParams {
  jobId: string;
  status: string;
  downloadUrl?: string;
  completedAt?: Date;
}

export async function UpdateJobIdData(params: UpdateJobParams) {
  const { jobId, status, downloadUrl, completedAt } = params;

  const exportRecord = await prisma.export.update({
    where: { jobId },
    data: {
      status,
      ...(downloadUrl && { downloadUrl }),
      ...(completedAt && { completedAt }),
    },
  });

  return exportRecord;
}