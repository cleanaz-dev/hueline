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
  callReason: CallReason; // Now using Prisma's enum
  hiddenNeedsFound: boolean;
  surfacePrepNeeds: boolean;
  structuralNeeds: boolean;
  technicalNeeds: boolean;
  estimatedAdditionalValue: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CallAnalysisResult {
  callReason: CallReason; // Now using Prisma's enum
  hiddenNeedsFound: boolean;
  surfacePrepNeeds: boolean;
  structuralNeeds: boolean;
  technicalNeeds: boolean;
  estimatedValue: number;
}