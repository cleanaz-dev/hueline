import { getRedisClient, keys } from "../../config";

interface RoomData {
  bookingId: string;
  roomName: string;
  clientName: string;
  clientPhone: string;
}

export async function setRoomKey(roomId: string, roomData: RoomData) {
  const client = await getRedisClient();
  const key = keys.room(roomId);
  // Store the entire room data as JSON
  await client.setEx(key, 3600, JSON.stringify(roomData));
  return true;
}

export async function getRoomKey(roomId: string) {
  const client = await getRedisClient();
  const key = keys.room(roomId);
  const data = await client.get(key);

  if (!data) throw new Error("Room not found");

  // Parse the JSON back into room data
  return JSON.parse(data) as RoomData;
}