// call-intelligence-types.ts
import { CallReason, CallOutcome } from "@/app/generated/prisma"; // Import both from Prisma

export interface Call {
  id: string;
  bookingDataId: string;
  callSid: string;
  recordingSid: string | null;
  audioUrl: string | null;
  duration: string | null;
  status: string | null;
  intelligence?: CallIntelligence | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CallIntelligence {
  id: string;
  callId: string;
  callReason: CallReason;
  hiddenNeedsFound: boolean;
  surfacePrepNeeds: boolean;
  structuralNeeds: boolean;
  technicalNeeds: boolean;
  estimatedAdditionalValue: number;
  projectScope: string;
  callSummary: string | null;
  callOutcome: CallOutcome | null; // Now using Prisma's enum
  createdAt: Date;
  updatedAt: Date;
}

export interface CallAnalysisResult {
  callReason: CallReason;
  hiddenNeedsFound: boolean;
  surfacePrepNeeds: boolean;
  structuralNeeds: boolean;
  technicalNeeds: boolean;
  estimatedValue: number;
  projectScope: string;
  callSummary: string;
  callOutcome: CallOutcome; // Using Prisma's enum
}

// REMOVE THIS - Use Prisma's enum instead
// export enum CallOutcome {
//   POSITIVE = "POSITIVE",
//   NEUTRAL = "NEUTRAL",
//   NEGATIVE = "NEGATIVE"
// }