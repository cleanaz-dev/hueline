import { prisma } from "@/lib/prisma"
import { headers } from "next/headers"
import { NextResponse } from "next/server"

interface Params {
  params: Promise<{
    huelineId: string,
    slug: string
  }>
}

export async function POST(req: Request, { params }: Params) {
  try {
    // Verify API key
    const headersList = await headers()
    const apiKey = headersList.get("x-api-key")
    
    if (apiKey !== process.env.INTERNAL_API_KEY) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { huelineId, slug } = await params
    const body = await req.json()
    const { jobId, status, downloadUrl, completedAt } = body

    // Get booking ID from huelineId
    const booking = await prisma.subBookingData.findUnique({
      where: { huelineId },
      select: { id: true },
    })

    if (!booking) {
      return NextResponse.json(
        { error: "Booking not found" },
        { status: 404 }
      )
    }

    // Update the export
    const updatedExport = await prisma.export.update({
      where: { jobId },
      data: {
        status,
        ...(downloadUrl && { downloadUrl }),
        ...(completedAt && { completedAt: new Date(completedAt) }),
      },
    })

    return NextResponse.json({ success: true, export: updatedExport })
  } catch (error) {
    console.error("Error updating export:", error)
    return NextResponse.json(
      { error: "Failed to update export" },
      { status: 500 }
    )
  }
}