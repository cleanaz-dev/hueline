import { RoomType } from "@/app/generated/prisma";
import { getRedisClient, keys } from "../../config";

interface RoomData {
  bookingId?: string;
  roomName: string;
  clientName?: string;
  clientPhone?: string;
  sessionType?: RoomType
}

interface ScopeData {
  caterory: string;
  item: string;
  action: string;
  estimatedValue?: number;
}

interface CachedRoomIntelligence {
  prompt: string;
  intelligence: {
    categories: Record<string, string>;
    examples?: any[];
  };
}

export async function setRoomKey(roomId: string, roomData: RoomData) {
  const client = await getRedisClient();
  const key = keys.room(roomId);
  await client.setEx(key, 3600, JSON.stringify(roomData));
  return true;
}

export async function getRoomKey(roomId: string) {
  const client = await getRedisClient();
  const key = keys.room(roomId);
  const data = await client.get(key);
  if (!data) return null;
  return JSON.parse(data) as RoomData;
}

export async function setRoomScope(roomId: string, data: ScopeData) {
  const client = await getRedisClient();
  const key = keys.roomScope(roomId);
  await client.rPush(key, JSON.stringify(data));
  return true;
}

export async function getRoomScope(roomId: string) {
  const client = await getRedisClient();
  const key = keys.roomScope(roomId);
  const data = await client.get(key);
  if (!data) return null;
  return JSON.parse(data) as ScopeData;
}

export async function setRoomIntelligence(slug: string, data: CachedRoomIntelligence) {
  const client = await getRedisClient();
  const key = keys.roomIntelligence(slug);
  await client.setEx(key, 3600, JSON.stringify(data));
  return true;
}

export async function getRoomIntelligence(slug: string) {
  const client = await getRedisClient();
  const key = keys.roomIntelligence(slug);
  const data = await client.get(key);
  if (!data) return null;
  return JSON.parse(data) as CachedRoomIntelligence;
}

export async function getRoomScopeData(roomId: string) {
  const client = await getRedisClient();
  const key = keys.roomScopeData(roomId);
  const data = await client.get(key);
  if(!data) return null
  return JSON.parse(data)
}