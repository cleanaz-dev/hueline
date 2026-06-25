// lib/services/ai-nudge.ts
import { after } from "next/server";
import { getRedisClient } from "@/lib/redis";
import { cancelPendingFollowUp } from "@/lib/aws/event-scheduler/cancel-followups";
import { randomUUID } from "crypto";
import axios from "axios";

const DEBOUNCE_DELAY_MS = 15000; // 15 seconds

export async function debounceAndNudgeAI(threadId: string, slug: string) {
  // 1. Instantly cancel any scheduled follow-ups so they don't fire
  await cancelPendingFollowUp(threadId);

  const redis = await getRedisClient();
  const messageJobId = randomUUID();
  const debounceKey = `nudge_debounce:${threadId}`;

  // 2. Set this message as the "latest" job in Redis
  await redis.set(debounceKey, messageJobId);

  // 3. Register the background task using Next.js 16 after()
  after(async () => {
    // Wait for the debounce window to see if they send more texts
    await new Promise((resolve) => setTimeout(resolve, DEBOUNCE_DELAY_MS));

    // Check if our job is STILL the latest job in Redis
    const currentJobId = await redis.get(debounceKey);

    if (currentJobId === messageJobId) {
      // No other texts came in during the 15 seconds! Trigger AI.
      await redis.del(debounceKey);

      try {
        await axios.post(
          `${process.env.NEXT_PUBLIC_APP_URL}/api/subdomain/${slug}/hue-claw/${threadId}/nudge`
        );
        console.log(`[ai-nudge] AI Nudged successfully for thread ${threadId}`);
      } catch (err) {
        console.error(`[ai-nudge] Failed to nudge AI for thread ${threadId}`, err);
      }
    } else {
      // Another text came in and overwrote the key. Exit silently.
      console.log(`[ai-nudge] Nudge debounced (skipped) for thread ${threadId}`);
    }
  });
}