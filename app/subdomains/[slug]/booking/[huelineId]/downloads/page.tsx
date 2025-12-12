import { notFound } from "next/navigation"
import ClientDownloadPage from "./client-download-page"
import { getExportDataRedis } from "@/lib/redis/services/sub-domain/get-export-data"

// Fix 1: Correct interface with searchParams as a separate prop
interface PageProps {
  params: Promise<{
    slug: string
    huelineId: string
  }>
  searchParams: Promise<{
    jobId?: string
    // Add other expected search params here
  }>
}

// Fix 2: Receive both params and searchParams as props (no hooks)
export default async function Page({ params, searchParams }: PageProps) {
  // Fix 3: Await both params and searchParams (they're Promises in Next.js 15+)
  const { slug, huelineId } = await params
  const { jobId } = await searchParams

  console.log("dls:", slug, huelineId, jobId)

  // Fix 4: Proper validation (use || instead of && for required fields)
  if (!slug || !huelineId || !jobId) return notFound()

  const data = await getExportDataRedis(jobId)

  return <ClientDownloadPage data={data} />
}