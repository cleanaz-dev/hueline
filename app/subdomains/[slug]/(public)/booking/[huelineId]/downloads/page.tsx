// app/subdomain/[slug]/booking/[huelineId]/downloads/page.tsx

import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import ClientDownloadPage from "@/components/subdomains/layout/client-download-page"

interface PageProps {
  params: Promise<{
    slug: string
    huelineId: string
  }>
  searchParams: Promise<{
    exportId?: string
  }>
}

export default async function Page({ params, searchParams }: PageProps) {
  const { slug, huelineId } = await params
  const { exportId } = await searchParams

  if (!slug || !huelineId) return notFound()

  return (
    <div>
      <ClientDownloadPage />
    </div>
  )
}