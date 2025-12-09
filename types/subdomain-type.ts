//types/subdomain-type.ts

export interface SubdomainAccountData {
  // --- Identity ---
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

  // --- SaaS Infrastructure (New Fields) ---
  twilioPhoneNumber: string | null;
  forwardingNumber: string | null;
  
  // --- Billing ---
  stripeCustomerId?: string | null; // Optional: Keep private if possible
  planStatus: string; // 'active', 'past_due'
  planName: string;   // 'Professional'
  currentPeriodEnd: Date | string | null; // String when coming from API JSON

  // --- Relations ---
  users: SubdomainUser[];
  
  // --- Timestamps ---
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
  audioUrl:string | null
  originalImages: string;
  summary: string;
  callDuration: string | null;
  dimensions: string | null;
  dateTime: Date;
  pin: string;
  expiresAt: number;
  createdAt: Date;
  updatedAt: Date | null;
  mockups: Mockup[];
  paintColors: PaintColor[];
  alternateColors: AlternateColor[];
  sharedAccess: SharedAccess[];
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
  image?: string | null; // Optional if you have avatars
}
