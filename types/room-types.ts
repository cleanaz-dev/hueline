export interface RoomData {
  bookingId?: string;
  roomName: string;
  clientName?: string;
  clientPhone?: string;
  sessionType?: "PROJECT" | "QUICK"; // Add this
}