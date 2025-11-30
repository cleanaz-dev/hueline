// lib/types/booking-types.ts

export interface PaintColor {
  ral: string;
  name: string;
  hex: string;
}

export interface MockupUrl {
  s3_key: string;
  room_type: string;
  color: PaintColor;
  presigned_url: string;
}

export interface SharedAccess {
  email: string;
  accessType: "customer" | "viewer";
  pin: string;
  createdAt: string;
}

export interface BookingParams {
  name?: string;
  room_type?: string;
  prompt?: string;
  original_images?: string;
  mockup_urls?: MockupUrl[];
  paint_colors?: PaintColor[];
  summary?: string;
  call_duration?: string;
  alternate_colors?: any[];
  dimensions?: string;
  date_time?: string;
  pin?: string;
  phone?: string;
  expires_at?: number;
  booking_id?: string;
  sharedAccess?: SharedAccess[];
}