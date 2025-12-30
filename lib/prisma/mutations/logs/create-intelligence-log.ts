import { prisma } from "@/lib/prisma";
import { CallOutcome } from "@/app/generated/prisma";

export async function createCallIntelligenceLog(params: {
  bookingDataId?: string | null;
  subdomainId: string;
  callSid: string;
  callReason: string;
  projectScope: string;
  estimatedAdditionalValue: number;
  recordingUrl?: string;
  duration?: string;
  callSummary?: string | null;
  callOutcome?: CallOutcome | null;
  customFields?: Record<string, any>;
}) {
  const {
    bookingDataId,
    subdomainId,
    callSid,
    callReason,
    projectScope,
    estimatedAdditionalValue,
    recordingUrl,
    duration,
    callSummary,
    callOutcome,
    customFields = {},
  } = params;

  // 1. Title Logic
  const titleMap: Record<string, string> = {
    NEW_PROJECT: "New Project Inquiry",
    STATUS_UPDATE: "Status Update Call",
    COLOR_CHANGE: "Color Change Request",
    PRICING: "Pricing Question",
    FOLLOW_UP: "Follow-up Call",
    OTHER: "General Call",
  };
  const title = titleMap[callReason] || "Call Completed";

  // 2. Dynamic Description Logic
  let description: string;

  if (callSummary) {
    // Priority: Use the AI-generated summary if it exists
    description = callSummary;
  } else {
    // Fallback: Dynamically find ANY true booleans in customFields
    // This works for "has_wood_rot", "is_luxury", "urgent_repair", etc.
    const findings = Object.entries(customFields)
      .filter(([key, value]) => {
        // Exclude large text fields or non-boolean values
        if (key === "transcriptText" || key === "transcript_text") return false;
        return value === true; // Only grab fields explicitly set to TRUE
      })
      .map(([key]) => {
        // Convert "has_wood_rot" or "surfacePrepNeeds" to "Has Wood Rot" / "Surface Prep Needs"
        return key
          .replace(/_/g, " ") // replace underscores with spaces
          .replace(/([A-Z])/g, " $1") // insert space before capital letters
          .replace(/^./, (str) => str.toUpperCase()) // capitalize first letter
          .trim();
      });

    if (findings.length > 0) {
      description = `Detected: ${findings.join(", ")}. Scope: ${projectScope}`;
    } else {
      description = `Analysis complete. Scope: ${projectScope}`;
    }
  }

  try {
    const log = await prisma.logs.create({
      data: {
        bookingDataId: bookingDataId || undefined,
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
          estimatedAdditionalValue,
          callSummary,
          callOutcome,
          ...customFields, // Save raw data for debugging
        },
      },
    });

    console.log(`📝 Call intelligence log created: ${callSid}`);
    return log;
  } catch (error) {
    console.error("❌ Failed to create call intelligence log:", error);
  }
}