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
  IMAGE = "IMAGE",
  QUESTION = "QUESTION",
  DETECTION = "DETECTION"
}

export interface ScopeItem {
  type: ScopeType;
  area: string;
  item: string;
  action: string;
  timestamp: string;
  image_urls?: string[];
  // Image tracking
  image_id?: string;
  image_reference_id?: string;
  // Detection data for doors/windows
  detection_data?: {
    doors: number;
    windows: number;
    summary: string;
  };
}
