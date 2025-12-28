import { getRedisClient, keys } from "../../config";

interface RoomData {
  bookingId: string;
  roomName: string;
  clientName: string;
  clientPhone: string;
}

interface ScopeData {
  caterory: string;
  item: string;
  action: string
  estimatedValue?: number 
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

  if (!data) return null

  // Parse the JSON back into room data
  return JSON.parse(data) as RoomData;
}

export async function setRoomScope(roomId: string, data: ScopeData) {
  const client = await getRedisClient()
  const key = keys.roomScope(roomId)

  await client.rPush(key, JSON.stringify(data))

  return true

}

export async function getRoomScope(roomId: string) {
  const client = await getRedisClient()
  const key = keys.roomScope(roomId)
  const data = await client.get(key)

  if(!data) return null

  return JSON.parse(data) as ScopeData
}