import {
  Call,
  CallIntelligence,
  ClientActivityType,
  CommunicationRole,
  CommunicationType,
  Customer,
  Job,
  LogActor,
} from "@/app/generated/prisma";
import { voiceMetadataSchema } from "@/lib/zod/job-voice-metadata";
import {
  getBookingSnapshot,
  updateBookingData,
  upsertCall,
} from "./mutations";

export type CallTriggerSource =
  | "CALL_INTELLIGENCE"
  | "REPEAT_CALL_INTELLIGENCE";

export interface CallContext {
  callerName: string;
  callerPhone: number;
  callSummary: string;
  toNumber: string;
  liveTransfer?: boolean;
  roomType: string;
  estimatedValue?: string;
  huelineId: string;
  call: Call;
  intelligence: CallIntelligence;
}

interface CallConfig {
  logActor: LogActor;
  role: CommunicationRole;
  logTitle: (ctx: CallContext) => string;
  logDescription: (ctx: CallContext) => string;
  activityType: ClientActivityType;
  activityTitle: (ctx: CallContext) => string;
  activityDescription: (ctx: CallContext) => string;
  communicationType: CommunicationType;
}

const CALL_CONFIG: Record<CallTriggerSource, CallConfig> = {
  CALL_INTELLIGENCE: {
    logActor: "CLIENT",
    role: "CLIENT",
    logTitle: (ctx) => `Client called at ${ctx.call.createdAt}`,
    logDescription: (ctx) => `Call regarding: ${ctx.callSummary}`,
    activityType: "INBOUND_CALL",
    activityTitle: (ctx) =>
      `${ctx.callerName} (${ctx.callerPhone}) called at ${ctx.call.createdAt}`,
    activityDescription: (ctx) =>
      `Call regarding: ${ctx.callerName} about ${ctx.roomType}, valued at ${ctx.intelligence.estimatedAdditionalValue}`,
    communicationType: "PHONE",
  },
  REPEAT_CALL_INTELLIGENCE: {
    logActor: "CLIENT",
    role: "CLIENT",
    logTitle: (ctx) => `Client called at ${ctx.call.createdAt}`,
    logDescription: (ctx) => `Call regarding: ${ctx.callSummary}`,
    activityType: "INBOUND_CALL",
    activityTitle: (ctx) =>
      `${ctx.callerName} (${ctx.callerPhone}) called at ${ctx.call.createdAt}`,
    activityDescription: (ctx) =>
      `Call regarding: ${ctx.callerName} about ${ctx.roomType}, valued at ${ctx.intelligence.estimatedAdditionalValue}`,
    communicationType: "PHONE",
  },
};

export interface CallWebhookBody {
  recording_url: string;
  status: "completed";
  transcript_text: string;
  action: CallTriggerSource;
  intelligence: {
    callReason?: string;
    projectScope?: string;
    callSummary?: string;
    callOutcome?: string;
    lastInteraction?: string;
    estimatedAdditionalValue?: number;
    costBreakdown?: string;
    [key: string]: any;
  };
}

export interface ProcessCallArgs {
  body: CallWebhookBody;
  job: Job;
  triggerSource: CallTriggerSource;
  customer: Customer;
}

export async function processCallWorkflow({
  body,
  job,
  triggerSource,
  customer,
}: ProcessCallArgs) {
  // 1. Validate job metadata
  const metadataResult = voiceMetadataSchema.safeParse(job.metadata);
  if (!metadataResult.success) {
    throw new Error(`Invalid job metadata: ${metadataResult.error.message}`);
  }

  const { callSid, duration, bookingId } = metadataResult.data;

  // 2. Destructure intelligence fields
  const {
    callReason,
    projectScope,
    estimatedAdditionalValue,
    callSummary,
    costBreakdown,
    callOutcome,
    lastInteraction,
    short_headline,
    ...filteredCustomFields
  } = body.intelligence ?? {};

  // 3. Upsert call + intelligence
  await upsertCall({
    callSid,
    recordingUrl: body.recording_url,
    transcriptText: body.transcript_text,
    duration,
    bookingId,
    intelligence: {
      callReason,
      projectScope,
      estimatedAdditionalValue,
      callSummary,
      costBreakdown,
      callOutcome,
      customFields: filteredCustomFields,
    },
  });

  // 4. Fetch current booking state for accumulation
  const existingBooking = await getBookingSnapshot(bookingId);

  // 5. Calculate accumulated values
  const additionalValue = Number(estimatedAdditionalValue) || 0;
  const currentTotal = Number(existingBooking?.estimatedValue) || 0;
  const newTotal = currentTotal + additionalValue;

  // Sticky project type — don't overwrite a known value with UNKNOWN
  let newProjectType = existingBooking?.projectType ?? undefined;
  if (
    body.intelligence.propertyType &&
    body.intelligence.propertyType !== "UNKNOWN"
  ) {
    newProjectType = body.intelligence.propertyType;
  }

  // Accumulative scope array — no duplicates, no UNKNOWNs
  const currentScopes = existingBooking?.projectScope ?? [];
  const newScopes = [...currentScopes];
  if (
    projectScope &&
    projectScope !== "UNKNOWN" &&
    !newScopes.includes(projectScope)
  ) {
    newScopes.push(projectScope);
  }

  // "Pulse" headline — prefer lastInteraction > short_headline > callReason
  let pulseString = "Interaction Logged";
  if (lastInteraction) {
    pulseString = lastInteraction;
  } else if (short_headline) {
    pulseString = short_headline;
  } else if (callReason && callReason !== "UNKNOWN") {
    const formatted = callReason.replace(/_/g, " ").toLowerCase();
    pulseString = formatted.charAt(0).toUpperCase() + formatted.slice(1);
  }

  // 6. Persist accumulated booking update
  await updateBookingData({
    bookingId,
    recordingUrl: body.recording_url,
    pulseString,
    callReason,
    newTotal,
    newProjectType,
    newScopes,
  });

  // 7. TODO: enter logs and activities here...
  
}