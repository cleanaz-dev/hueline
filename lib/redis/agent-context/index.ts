// lib/redis/agent-context/index.ts

import { Redis } from "@upstash/redis";

// Initialize the Upstash Redis client
export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

// Define the shape of your context payload (adjust types as needed)
export interface AgentContextMessage {
  role: string;
  content: string;
  date: string | Date;
}

export interface AgentContextPayload {
  customer: {
    name: string | null;
    email: string | null;
    phone: string;
  };
  operator: {
    name: string | null;
    phone: string;
    id: string;
  };
  recentMessages: AgentContextMessage[];
  quotes: any[]; // Replace `any[]` with your actual Prisma Quote type
  paintColors: any[]; // Replace `any[]` with your actual Prisma PaintColor type
}

// Helper to generate consistent keys
const getContextKey = (roomName: string) => `agent_context:${roomName}`;

/**
 * Saves the agent context to Redis with a 1-hour TTL.
 * The AI Agent will fetch this when it spins up in the LiveKit room.
 */
export async function setAgentContext(
  roomName: string,
  payload: AgentContextPayload
): Promise<void> {
  const key = getContextKey(roomName);
  try {
    // Upstash automatically JSON.stringifies objects!
    // ex: 3600 sets the expiration to 1 hour (in seconds)
    await redis.set(key, payload, { ex: 3600 });
  } catch (error) {
    console.error(`[Redis] Failed to set agent context for ${roomName}:`, error);
    throw error; // Let the API route catch it
  }
}

/**
 * Retrieves the agent context from Redis.
 */
export async function getAgentContext(
  roomName: string
): Promise<AgentContextPayload | null> {
  const key = getContextKey(roomName);
  try {
    // Upstash automatically parses JSON back to an object
    const data = await redis.get<AgentContextPayload>(key);
    return data;
  } catch (error) {
    console.error(`[Redis] Failed to get agent context for ${roomName}:`, error);
    return null;
  }
}

/**
 * Deletes the agent context manually (e.g., when the call ends early).
 */
export async function deleteAgentContext(roomName: string): Promise<void> {
  const key = getContextKey(roomName);
  try {
    await redis.del(key);
  } catch (error) {
    console.error(`[Redis] Failed to delete agent context for ${roomName}:`, error);
  }
}

/**
 * Saves the timeline data to Redis with a 45-minute TTL.
 * Upstash automatically handles JSON stringification/parsing.
 */
export async function setTimelineCache(
  slug: string,
  threadId: string,
  timeline: unknown // Replace `unknown` with your actual Timeline event type
): Promise<void> {
  const cacheKey = `timeline:${slug}:${threadId}`;
  try {
    // Pass the object directly to Upstash, it handles JSON.stringify
    // ex: 2700 = 45 minutes in seconds
    await redis.set(cacheKey, timeline, { ex: 2700 });
  } catch (error) {
    console.error(`[Redis] Failed to set timeline cache for ${slug}:${threadId}:`, error);
    // We don't throw here usually, as caching failures shouldn't break the API response
  }
}

/**
 * Retrieves the cached timeline data from Redis.
 */
export async function getTimelineCache<T>(
  slug: string,
  threadId: string
): Promise<T | null> {
  const cacheKey = `timeline:${slug}:${threadId}`;
  try {
    const data = await redis.get<T>(cacheKey);
    return data;
  } catch (error) {
    console.error(`[Redis] Failed to get timeline cache for ${slug}:${threadId}:`, error);
    return null;
  }
}

/**
 * Deletes Thread on every change or update to the thread
 */
export async function invalidateThreadCache(slug: string, threadId: string) {
  const cacheKey = `timeline:${slug}:${threadId}`;
  await redis.del(cacheKey);
}


// ─── Live Transcript (per call) ──────────────────────────────────────────────

export interface TranscriptLine {
  role: string;
  text: string;
  timestamp: string;
}

const getTranscriptKey = (callId: string) => `live_transcript:${callId}`;

/**
 * Appends a finalized transcript line to the call's Redis list.
 * TTL of 2 hours in case the call ends without cleanup.
 */
export async function appendTranscriptLine(
  callId: string,
  line: TranscriptLine
): Promise<void> {
  const key = getTranscriptKey(callId);
  // Upstash rpush expects spread args, not an array
  await redis.rpush(key, JSON.stringify(line));
  await redis.expire(key, 7200);
}

/**
 * Returns all transcript lines for a call, in order.
 */
export async function getTranscript(callId: string): Promise<TranscriptLine[]> {
  const key = getTranscriptKey(callId);
  const lines = await redis.lrange<string>(key, 0, -1);
  return lines.map((l) => JSON.parse(l) as TranscriptLine);
}

/**
 * Deletes the transcript once it's been persisted to the DB.
 */
export async function deleteTranscript(callId: string): Promise<void> {
  await redis.del(getTranscriptKey(callId));
}