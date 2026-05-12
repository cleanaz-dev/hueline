import {
  Call,
  CallIntelligence,
  CallOutcome,
  CallReason,
  ClientActivityType,
  CommunicationRole,
  CommunicationType,
  Customer,
  Job,
  LogActor,
} from "@/app/generated/prisma";
import { prisma } from "@/lib/prisma";
import { voiceMetadataSchema } from "@/lib/zod/job-voice-metadata";

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
    logTitle: (ctx) => `Client called  at ${ctx.call.createdAt}`,
    logDescription: (ctx) => `Call regarding: ${ctx.callSummary}`,
    activityType: "INBOUND_CALL",
    activityTitle: (ctx) =>
      `${ctx.callerName} (${ctx.callerPhone}) called at  ${ctx.call.createdAt}`,
    activityDescription: (ctx) =>
      `Call regarding: ${ctx.callerName} about ${ctx.roomType}, called valued at ${ctx.intelligence.estimatedAdditionalValue}`,
    communicationType: "PHONE",
  },
  REPEAT_CALL_INTELLIGENCE: {
    logActor: "CLIENT",
    role: "CLIENT",
    logTitle: (ctx) => `Client called  at ${ctx.call.createdAt}`,
    logDescription: (ctx) => `Call regarding: ${ctx.callSummary}`,
    activityType: "INBOUND_CALL",
    activityTitle: (ctx) =>
      `${ctx.callerName} (${ctx.callerPhone}) called at  ${ctx.call.createdAt}`,
    activityDescription: (ctx) =>
      `Call regarding: ${ctx.callerName} about ${ctx.roomType}, called valued at ${ctx.intelligence.estimatedAdditionalValue}`,
    communicationType: "PHONE",
  },
};

export interface CallWebhookBody {
  recording_url: string; // Replaced s3Key
  status: "completed";
  transcript_text: string; // Added this from Python
  action: CallTriggerSource;

  // The LLM Output (Matches the Zod schema we made)
  intelligence: {
    callReason?: string;
    projectScope?: string;
    callSummary?: string;
    callOutcome?: string;
    lastInteraction?: string;
    estimatedAdditionalValue?: number;
    costBreakdown?: string;
    [key: string]: any; // Allows custom dynamic fields from your Python schema
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
  const config = CALL_CONFIG[triggerSource];

  const metadataResult = voiceMetadataSchema.safeParse(job.metadata);
  if (!metadataResult.success) {
    throw new Error(`Invalid job metadata: ${metadataResult.error.message}`);
  }

  const { callId, callSid, duration, from, to, bookingId } = metadataResult.data; // typed & validated ✅

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
    } = body.intelligence || {};

    const huelineId = job.huelineId

     const updatedCall = await prisma.call.upsert({
          where: { callSid },
          update: {
            audioUrl: body.recording_url,
            duration: duration ? String(duration) : undefined,
            status: "completed",
            ...(bookingId && { bookingId }),
    
            intelligence: {
              upsert: {
                create: {
                  transcriptText: body.transcript_text,
                  callReason: callReason as CallReason,
                  projectScope: projectScope,
                  estimatedAdditionalValue: estimatedAdditionalValue || 0,
                  costBreakdown: costBreakdown || null, 
                  callSummary: callSummary || null,
                  callOutcome: callOutcome as CallOutcome,
                  customFields: filteredCustomFields,
                },
                update: {
                  transcriptText: body.transcript_text,
                  callReason: callReason as CallReason,
                  projectScope: projectScope,
                  estimatedAdditionalValue: estimatedAdditionalValue || 0,
                  costBreakdown: costBreakdown || null, 
                  callSummary: callSummary || null,
                  callOutcome: callOutcome as CallOutcome,
                  customFields: filteredCustomFields,
                },
              },
            },
          },
          create: {
            callSid,
            audioUrl: body.recording_url || "",
            duration: duration ? String(duration) : "0",
            status: "completed",
            bookingDataId: bookingId,
            intelligence: {
              create: {
                transcriptText: body.transcript_text,
                callReason: callReason as CallReason,
                projectScope: projectScope,
                estimatedAdditionalValue: estimatedAdditionalValue || 0,
                costBreakdown: costBreakdown || null, 
                callSummary: callSummary || null,
                callOutcome: callOutcome as CallOutcome,
                customFields: filteredCustomFields,
              },
            },
          },
          include: {
            bookingData: { select: { huelineId: true } },
          },
        });

          const additionalValue = Number(estimatedAdditionalValue) || 0;
        
              // A. FETCH CURRENT STATE (Required for Accumulation Logic)
              const existingBooking = await prisma.subBookingData.findUnique({
                where: { id: bookingId },
                select: {
                  estimatedValue: true,
                  projectType: true,
                  projectScope: true, // Now an Array
                },
              });
        
              // B. CALCULATE UPDATES
        
              // 1. Math (Cumulative)
              const currentTotal = Number(existingBooking?.estimatedValue) || 0;
              const newTotal = currentTotal + additionalValue;
        
              // 2. Project Type (Sticky - Don't overwrite known with unknown)
              let newProjectType = existingBooking?.projectType;
              if (
                body.intelligence.propertyType &&
                body.intelligence.propertyType !== "UNKNOWN"
              ) {
                newProjectType = body.intelligence.propertyType;
              }
        
              // 3. Project Scope (Accumulative Array)
              const incomingScope = projectScope;
              // Ensure we have an array to start with
              const currentScopes = existingBooking?.projectScope || [];
              const newScopes = [...currentScopes];
        
              // Only add if it's valid, not unknown, and not already in the list
              if (
                incomingScope &&
                incomingScope !== "UNKNOWN" &&
                !newScopes.includes(incomingScope)
              ) {
                newScopes.push(incomingScope);
              }
        
              // 4. Last Interaction (The "Pulse" Headline)
              let pulseString = "Interaction Logged";
        
              if (lastInteraction) {
                pulseString = lastInteraction;
              } else if (short_headline) {
                pulseString = short_headline;
              } else if (callReason && callReason !== "UNKNOWN") {
                pulseString = callReason.replace(/_/g, " ").toLowerCase();
                pulseString =
                  pulseString.charAt(0).toUpperCase() + pulseString.slice(1);
              }
        
              // C. PERFORM UPDATE
              await prisma.subBookingData.update({
                where: { id: bookingId },
                data: {
                  // --- SNAPSHOT FIELDS (Latest Info) ---
                  lastCallAt: new Date(),
                  lastCallAudioUrl: body.recording_url,
                  lastInteraction: pulseString, // The readable dashboard headline
                  lastCallReason: (callReason && callReason !== "UNKNOWN" ? callReason : undefined) as CallReason,
        
                  // --- STICKY / ACCUMULATIVE FIELDS ---
                  estimatedValue: newTotal,
                  projectType: newProjectType,
                  projectScope: newScopes, // Saves the accumulated array
                },
              });

              // then enter logs and activities here...
        
}
