//types/subdomain-type.ts

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
  createdAt: Date;
  updatedAt: Date;
}

export interface BookingData {
  id: string;
  name: string;
  phone: string;
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
  huelineId: string;
  createdAt: Date;
  updatedAt: Date;
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
  email: string;
  accessType: string;
  pin: string;
  createdAt: Date;
}
