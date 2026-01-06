export interface RoomData {
  bookingId?: string;
  roomName: string;
  clientName?: string;
  clientPhone?: string;
  sessionType?: "PROJECT" | "QUICK" | "SELF_SERVE"
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