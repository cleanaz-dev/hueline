import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"; // Adjust path to your prisma instance
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";

// GET: Load the latest flow and a list of versions
export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  // 1. Get Subdomain ID
  const subdomain = await prisma.subdomain.findUnique({
    where: { slug },
    select: { id: true, activeFlowId: true },
  });

  if (!subdomain)
    return NextResponse.json({ error: "Subdomain not found" }, { status: 404 });

  // 2. Fetch all versions (sorted newest first)
  const flows = await prisma.callFlow.findMany({
    where: { subdomainId: subdomain.id },
    orderBy: { version: "desc" },
    select: {
      id: true,
      version: true,
      createdAt: true,
      isPublished: true,
      nodes: true,
    }, // We fetch nodes here for simplicity, or fetch on demand
  });

  return NextResponse.json({
    versions: flows,
    activeFlowId: subdomain.activeFlowId,
  });
}

// POST: Save a new version
export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const body = await request.json();
  const { nodes } = body; // The entire FlowNode tree

  // 1. Get Subdomain
  const subdomain = await prisma.subdomain.findUnique({
    where: { slug },
    select: { id: true },
  });

  if (!subdomain)
    return NextResponse.json({ error: "Subdomain not found" }, { status: 404 });

  // 2. Get current latest version number
  const latestFlow = await prisma.callFlow.findFirst({
    where: { subdomainId: subdomain.id },
    orderBy: { version: "desc" },
    select: { version: true },
  });

  const newVersion = (latestFlow?.version || 0) + 1;

  // 3. Create new Version
  const createdFlow = await prisma.callFlow.create({
    data: {
      subdomainId: subdomain.id,
      version: newVersion,
      nodes: nodes, // Saves the JSON tree
    },
  });

  // 4. Cleanup: Keep only last 10 versions
  // Fetch IDs of all flows sorted by version DESC
  const allFlows = await prisma.callFlow.findMany({
    where: { subdomainId: subdomain.id },
    orderBy: { version: "desc" },
    select: { id: true },
  });

  if (allFlows.length > 10) {
    const toDelete = allFlows.slice(10).map((f) => f.id);
    await prisma.callFlow.deleteMany({
      where: { id: { in: toDelete } },
    });
  }

  return NextResponse.json({ success: true, flow: createdFlow });
}

// PATCH: Publish a specific version (Make it active)
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const { flowId } = await request.json();

  const subdomain = await prisma.subdomain.update({
    where: { slug },
    data: { activeFlowId: flowId },
  });

  // Also update the boolean flags on the flows for UI convenience
  await prisma.callFlow.updateMany({
    where: { subdomainId: subdomain.id },
    data: { isPublished: false },
  });

  await prisma.callFlow.update({
    where: { id: flowId },
    data: { isPublished: true },
  });

  return NextResponse.json({ success: true });
}
