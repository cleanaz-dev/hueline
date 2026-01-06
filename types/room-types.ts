import { RoomType } from "@/app/generated/prisma";

export interface RoomData {
  bookingId?: string;
  roomName: string;
  clientName?: string;
  clientPhone?: string;
  sessionType?: RoomType;
}

export enum ScopeType {
  PREP = "PREP",
  PAINT = "PAINT",
  REPAIR = "REPAIR",
  NOTE = "NOTE",
  IMAGE = "IMAGE"
}

export interface ScopeItem {
  type: ScopeType;
  area: string;
  item: string;
  action: string;
  timestamp: string;
  image_urls?: string[];
  // New fields for image tracking
  image_id?: string;  // Present on IMAGE type items - unique ID for this image
  image_reference_id?: string;  // Present on other items - references the associated IMAGE's image_id
}