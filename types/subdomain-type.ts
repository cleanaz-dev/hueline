import { Prisma } from "@/app/generated/prisma";
import { 
  CallReason, 
  CallOutcome, 
  LogType, 
  LogActor,
  RoomStatus,
  Subdomain,
  RoomIntelligence
} from "@/app/generated/prisma";

// --- INTELLIGENCE INTERFACES ---

// 1. Global Config (Attached to Subdomain)
export interface Intelligence {
  id: string;
  prompt: string | null;
  values: Prisma.JsonValue | null;
  schema: Prisma.JsonValue | null;
  createdAt: Date | string | null;
  updatedAt: Date | string | null;
}

// 2. Call Results (Attached to Call)
export interface CallIntelligence {
  id: string;
  callId: string;
  callReason: CallReason;
  projectScope: string | null;
  callOutcome: CallOutcome | null;
  estimatedAdditionalValue: number;
  customFields: Prisma.JsonValue | null;
  transcriptText: string | null;
  callSummary: string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
}

// --- ROOM INTERFACE ---

export interface Room {
  id: string;
  roomKey: string;
  
  clientName?: string | null;
  clientPhone?: string | null;
  status: RoomStatus;
  
  // Relations (Keep these as-is)
  creatorId: string | null;
  creator?: SubdomainUser | null;
  bookingId?: string | null;
  booking?: BookingData | null;
  domainId: string;
  domain?: Subdomain | null;

  // 👇 THE FIX: Define the specific shape, don't use Prisma.JsonValue
  scopeData?: Prisma.JsonValue

  recordingUrl?: string | null;
  transcript?: string | null;
  endedAt?: Date | string | null;
  
  // Allow string for serialization (Next.js passes dates as strings to client)
  createdAt: Date | string;
  updatedAt: Date | string;
}

// --- SUBDOMAIN INTERFACE ---

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
  
  // Call Flow
  callFlows?: CallFlow[];
  activeFlowId?: string | null;
  
  intelligence?: Intelligence | null;
  roomIntelligence?: RoomIntelligence | null
  
  createdAt: Date | string;
  updatedAt: Date | string | null;
  rooms: Room[];
}

// --- BOOKING DATA INTERFACE ---

export interface BookingData {
  id: string;
  subdomainId: string;
  huelineId: string;
  name: string;
  phone: string;
  roomType: string;
  prompt: string;
  originalImages: string;
  summary: string;
  dimensions: string | null;
  dateTime: Date | string;
  pin: string;
  expiresAt: number;
  
  // --- PULSE / STATUS FIELDS ---
  
  // 1. Genesis
  initialIntent: CallReason;

  // 2. Snapshot (Latest Info)
  lastCallReason?: CallReason | null;
  lastCallAt?: Date | string | null;
  lastCallAudioUrl?: string | null;
  lastInteraction?: string | null; // ✅ The new headline field
  lastVideoUrl?:     string | null;
  lastVideoAt? :     string | null;

  // 3. Cumulative / Sticky (Profile Info)
  projectType?: string | null;
  estimatedValue?: number | null;
  
  // ✅ FIXED: Renamed & Changed to Array
  // Was: currentProjectScope?: string | null;
  projectScope?: string[]; 

  // --- RELATIONS ---
  // These are optional because Prisma doesn't fetch them by default
  mockups: Mockup[];
  paintColors?: PaintColor[];
  alternateColors?: AlternateColor[];
  sharedAccess?: SharedAccess[];
  exports?: Export[];
  calls?: Call[];
  logs?: Log[];
  rooms?: Room[];

  createdAt: Date | string;
  updatedAt: Date | string;
}

// --- CALL INTERFACE ---

export interface Call {
  id: string;
  bookingDataId: string | null;
  bookingData?: BookingData | null; 
  callSid: string;
  recordingSid: string | null;
  audioUrl: string | null;
  duration: string | null;
  status: string | null;

  // Specific Call Analytics
  intelligence?: CallIntelligence | null;

  createdAt: Date | string;
  updatedAt: Date | string;
}

// --- SUPPORTING INTERFACES ---

export interface CallFlow {
  id: string;
  subdomainId: string;
  version: number;
  nodes: Prisma.JsonValue;
  isPublished: boolean;
  createdAt: Date | string;
}

export interface Export {
  id: string;
  jobId: string;
  bookingId: string;
  resolution: string;
  imageCount: number;
  status: string;
  downloadUrl?: string | null;
  createdAt: Date | string;
  completedAt?: Date | string | null;
}

export interface Mockup {
  id: string;
  s3Key: string;
  roomType: string;
  presignedUrl: string | null;
  colorRal: string;
  colorName: string;
  colorHex: string;
  createdAt: Date | string;
}

export interface PaintColor {
  id: string;
  ral: string;
  name: string;
  hex: string;
  createdAt: Date | string;
}

export interface AlternateColor {
  id: string;
  ral: string;
  name: string;
  hex: string;
  createdAt: Date | string;
}

export interface SharedAccess {
  id: string;
  email: string | null;
  accessType: string | null;
  pin: string | null;
  createdAt: Date | string;
}

export interface SubdomainUser {
  id: string;
  name: string | null;
  email: string;
  role: string;
  imageUrl?: string | null;
}

export interface Log {
  id: string;
  bookingDataId?: string | null;
  subdomainId: string;
  type: LogType;
  actor: LogActor;
  title: string;
  description: string | null;
  metadata?: Prisma.JsonValue | null; 
  createdAt: Date | string;
  updatedAt: Date | string;
  subdomain?: {
    companyName: string | null;
  };
}