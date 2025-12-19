// call-intelligence-types.ts
import { CallReason } from "@/app/generated/prisma";

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
  callSummary: string | null;        // NEW
  callOutcome: CallOutcome | null;   // NEW
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
  callSummary: string;               // NEW
  callOutcome: CallOutcome;          // NEW
}

export enum CallOutcome {
  POSITIVE = "POSITIVE",
  NEUTRAL = "NEUTRAL",
  NEGATIVE = "NEGATIVE"
}