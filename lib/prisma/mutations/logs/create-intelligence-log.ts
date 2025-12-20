import { prisma } from "@/lib/prisma";
import { CallOutcome } from "@/app/generated/prisma";

export async function createCallIntelligenceLog(params: {
  bookingDataId: string;
  subdomainId: string;
  callSid: string;
  callReason: string;
  projectScope: string;
  hiddenNeedsFound: boolean;
  surfacePrepNeeds: boolean;
  structuralNeeds: boolean;
  technicalNeeds: boolean;
  estimatedAdditionalValue: number;
  recordingUrl?: string;
  duration?: string;
  callSummary?: string | null;
  callOutcome?: CallOutcome | null;
}) {
  const {
    bookingDataId,
    subdomainId,
    callSid,
    callReason,
    projectScope,
    hiddenNeedsFound,
    surfacePrepNeeds,
    structuralNeeds,
    technicalNeeds,
    estimatedAdditionalValue,
    recordingUrl,
    duration,
    callSummary,
    callOutcome,
  } = params;

  // Create a human-readable title based on the call reason
  const titleMap: Record<string, string> = {
    NEW_PROJECT: "New Project Inquiry",
    STATUS_UPDATE: "Status Update Call",
    COLOR_CHANGE: "Color Change Request",
    PRICING: "Pricing Question",
    FOLLOW_UP: "Follow-up Call",
    OTHER: "General Call",
  };

  const title = titleMap[callReason] || "Call Completed";

  // Build a description - prioritize callSummary if available
  let description: string;
  
  if (callSummary) {
    // Use AI-generated summary as the description
    description = callSummary;
  } else {
    // Fallback to the old logic if no summary
    const findings: string[] = [];
    if (hiddenNeedsFound) findings.push("hidden needs identified");
    if (surfacePrepNeeds) findings.push("surface prep required");
    if (structuralNeeds) findings.push("structural work needed");
    if (technicalNeeds) findings.push("technical requirements");
    
    description =
      findings.length > 0
        ? `AI Analysis: ${findings.join(", ")}. Scope: ${projectScope}`
        : `AI Analysis complete. Scope: ${projectScope}`;
  }

  try {
    const log = await prisma.logs.create({
      data: {
        bookingDataId,
        subdomainId,
        type: "CALL",
        actor: "AI",
        title,
        description,
        metadata: {
          callSid,
          duration,
          recordingUrl,
          stage: "intelligence",
          callReason,
          projectScope,
          hiddenNeedsFound,
          surfacePrepNeeds,
          structuralNeeds,
          technicalNeeds,
          estimatedAdditionalValue,
          callSummary,
          callOutcome,
        },
      },
    });

    console.log(`📝 Call intelligence log created: ${callSid} (Outcome: ${callOutcome || 'N/A'})`);
    return log;
  } catch (error) {
    console.error("❌ Failed to create call intelligence log:", error);
    throw error;
  }
}