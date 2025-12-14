// call-intelligence-types.ts

export enum CallReason {
  NEW_PROJECT = 'NEW_PROJECT',
  STATUS_UPDATE = 'STATUS_UPDATE',
  COLOR_CHANGE = 'COLOR_CHANGE',
  PRICING = 'PRICING',
  FOLLOW_UP = 'FOLLOW_UP',
  OTHER = 'OTHER'
}

export interface Call {
  id: string;
  bookingDataId: string;
  callSid: string;
  recordingSid: string | null;
  audioUrl: string | null;
  duration: string | null;
  status: string | null;
  intelligence?: CallIntelligence | null; // Add ? here
  createdAt: Date;
  updatedAt: Date;
}

export interface CallIntelligence {
  id: string;
  callId: string; // Changed from bookingDataId
  callReason: CallReason;
  hiddenNeedsFound: boolean;
  surfacePrepNeeds: boolean;
  structuralNeeds: boolean;
  technicalNeeds: boolean;
  estimatedAdditionalValue: number;
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
}