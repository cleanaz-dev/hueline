import { RoomType } from "@/app/generated/prisma";

export interface RoomData {
  bookingId?: string;
  roomName: string;
  clientName?: string;
  clientPhone?: string;
  sessionType?: RoomType
}

export interface ScopeItem {
  type: string; // "PREP" | "PAINT" | "REPAIR" | "NOTE"
  area: string;
  item: string;
  action: string;
  timestamp?: string; // ISO String
  image_url?: string | null;
  images?: string[]; // Optional extra support if your schema evolves
}