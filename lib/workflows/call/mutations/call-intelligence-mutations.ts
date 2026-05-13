import {
  CallOutcome,
  CallReason,
  Prisma,
} from "@/app/generated/prisma";
import { prisma } from "@/lib/prisma";

// ─── Upsert Call + CallIntelligence ──────────────────────────────────────────

interface UpsertCallArgs {
  callSid: string;
  recordingUrl: string;
  transcriptText: string;
  duration?: number;
  bookingId?: string;
  intelligence: {
    callReason?: string;
    projectScope?: string;
    estimatedAdditionalValue?: number;
    callSummary?: string;
    costBreakdown?: string;
    callOutcome?: string;
    customFields: Prisma.InputJsonValue;
  };
}

export async function upsertCall({
  callSid,
  recordingUrl,
  transcriptText,
  duration,
  bookingId,
  intelligence,
}: UpsertCallArgs) {
  const {
    callReason,
    projectScope,
    estimatedAdditionalValue,
    callSummary,
    costBreakdown,
    callOutcome,
    customFields,
  } = intelligence;

  const intelligencePayload = {
    transcriptText,
    callReason: callReason as CallReason,
    projectScope,
    estimatedAdditionalValue: estimatedAdditionalValue ?? 0,
    costBreakdown: costBreakdown ?? null,
    callSummary: callSummary ?? null,
    callOutcome: callOutcome as CallOutcome,
    customFields: customFields as Prisma.InputJsonValue,
  };

  return prisma.call.upsert({
    where: { callSid },
    update: {
      audioUrl: recordingUrl,
      duration: duration ? String(duration) : undefined,
      status: "completed",
      ...(bookingId && { bookingId }),
      intelligence: {
        upsert: {
          create: intelligencePayload,
          update: intelligencePayload,
        },
      },
    },
    create: {
      callSid,
      audioUrl: recordingUrl,
      duration: duration ? String(duration) : "0",
      status: "completed",
      bookingDataId: bookingId,
      intelligence: {
        create: intelligencePayload,
      },
    },
    include: {
      bookingData: { select: { huelineId: true } },
    },
  });
}

// ─── Fetch Existing Booking (for accumulation logic) ─────────────────────────

export async function getBookingSnapshot(bookingId: string) {
  return prisma.subBookingData.findUnique({
    where: { id: bookingId },
    select: {
      estimatedValue: true,
      projectType: true,
      projectScope: true,
    },
  });
}

// ─── Update SubBookingData (accumulated fields) ───────────────────────────────

interface UpdateBookingArgs {
  bookingId: string;
  recordingUrl: string;
  pulseString: string;
  callReason?: string;
  newTotal: number;
  newProjectType?: string;
  newScopes: string[];
}

export async function updateBookingData({
  bookingId,
  recordingUrl,
  pulseString,
  callReason,
  newTotal,
  newProjectType,
  newScopes,
}: UpdateBookingArgs) {
  return prisma.subBookingData.update({
    where: { id: bookingId },
    data: {
      // Snapshot fields (latest info)
      lastCallAt: new Date(),
      lastCallAudioUrl: recordingUrl,
      lastInteraction: pulseString,
      lastCallReason: (callReason && callReason !== "UNKNOWN"
        ? callReason
        : undefined) as CallReason,

      // Sticky / accumulative fields
      estimatedValue: newTotal,
      projectType: newProjectType,
      projectScope: newScopes,
    },
  });
}