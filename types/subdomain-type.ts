import { Call } from "./call-intelligence-types";
import { Prisma } from "@/app/generated/prisma";

export interface SubdomainAccountData {
  id: string;
  slug: string;
  companyName: string | null;
  projectUrl: string | null;
  logo: string | null;
  logoWidth: number | null;
  logoHeight: number | null;
  splashScreen: string | null;
  theme: any | null;
  active: boolean;

  twilioPhoneNumber: string | null;
  forwardingNumber: string | null;
  
  stripeCustomerId?: string | null;
  planStatus: string;
  planName: string;
  currentPeriodEnd: Date | string | null;

  users: SubdomainUser[];
  
  createdAt: Date | string;
  updatedAt: Date | string | null;
}

export interface BookingData {
  id: string;
  name: string;
  phone: string;
  huelineId: string;
  roomType: string;
  prompt: string;
  originalImages: string;
  summary: string;
  dimensions: string | null;
  dateTime: Date;
  pin: string;
  expiresAt: number;
  createdAt: Date;
  updatedAt: Date;
  
  // --- NEW PULSE FIELDS (Added these) ---
  projectType?: "RESIDENTIAL" | "COMMERCIAL" | string | null; // <--- Match your DB field name
  initialIntent?: string | null;      // The Anchor (e.g. "NEW_PROJECT")
  currentCallReason?: string | null;  // The Pulse (e.g. "PRICING")
  currentProjectScope?: string | null;// The Scope (e.g. "INTERIOR")
  lastCallAt?: Date | string | null;  // Sorting
  lastCallAudioUrl?: string | null;   // Instant Playback
  // -------------------------------------

  mockups: Mockup[];
  paintColors: PaintColor[];
  alternateColors: AlternateColor[];
  sharedAccess: SharedAccess[];
  exports: Export[];
  calls: Call[];
  logs: Log[]
}

export interface Export {
  id: string;
  jobId: string;
  bookingId: string;
  resolution: string;
  imageCount: number;
  status: string;
  downloadUrl?: string | null;
  createdAt: Date;
  completedAt?: Date | null;
}

export interface Mockup {
  id: string;
  s3Key: string;
  roomType: string;
  presignedUrl: string | null;
  colorRal: string;
  colorName: string;
  colorHex: string;
  createdAt: Date;
}

export interface PaintColor {
  id: string;
  ral: string;
  name: string;
  hex: string;
  createdAt: Date;
}

export interface AlternateColor {
  id: string;
  ral: string;
  name: string;
  hex: string;
  createdAt: Date;
}

export interface SharedAccess {
  id: string;
  email: string | null;
  accessType: string | null;
  pin: string | null;
  createdAt: Date;
}

export interface SubdomainUser {
  id: string;
  name: string | null;
  email: string;
  role: string;
  imageUrl?: string | null;
}


export type LogType = 'CALL' | 'MOCKUP' | 'PAYMENT' | 'STATUS_CHANGE' | 'SMS' | 'NOTE';
export type LogActor = 'AI' | 'SYSTEM' | 'PAINTER' | 'CLIENT';

// 1. Define the Metadata Shape
export interface LogMetadata {
  // Common fields we expect (You get autocomplete for these)
  duration?: number | string;
  recordingUrl?: string;
  amount?: number;
  previousStatus?: string;
  newStatus?: string;
  note?: string;

  // The "Catch-All" (Allows any other random JSON data without errors)
  [key: string]: any;
}

// 2. The Main Log Interface
export interface Log {
  id: string;
  bookingDataId: string;
  subdomainId: string;
  
  type: LogType;
  actor: LogActor;
  
  title: string;
  description: string | null;

  // 3. Accept JsonValue from Prisma
  metadata?: Prisma.JsonValue | null; 

  createdAt: Date | string;
  updatedAt: Date | string;
}