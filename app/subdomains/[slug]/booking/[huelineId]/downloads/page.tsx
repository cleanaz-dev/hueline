import { notFound } from "next/navigation"
import { getExportDataRedis } from "@/lib/redis/services/sub-domain/get-export-data"
import { UpdateJobIdData } from "@/lib/prisma/mutations/export-data/update-job-id-data"
import ClientDownloadPage from "@/components/subdomains/layout/client-download-page"

interface PageProps {
  params: Promise<{
    slug: string
    huelineId: string
  }>
  searchParams: Promise<{
    jobId?: string
  }>
}

export default async function Page({ params, searchParams }: PageProps) {
  const { slug, huelineId } = await params
  const { jobId } = await searchParams

  if (!slug || !huelineId) return notFound()

  // If there's a jobId in the URL (from SMS), check Redis and update DB
  if (jobId) {
    const data = await getExportDataRedis(jobId)

    if (data && data.status === "complete") {
      await UpdateJobIdData({
        jobId,
        status: data.status,
        downloadUrl: data.download_url,
        completedAt: data.completed_at ? new Date(data.completed_at) : new Date(),
      })
    }
  }

  return (
    <div>
      <ClientDownloadPage />
   
    </div>
  )
}