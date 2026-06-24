"use client";

import Pusher from "pusher-js";

const PusherClient = (Pusher as any).default || Pusher;

/**
 * Initialize Pusher ONLY in the browser. 
 * On the server, this will be null.
 */
export const pusherClient =
  typeof window !== "undefined"
    ? new PusherClient(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
        cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
      })
    : null;