import Replicate from "replicate";

export const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

export const models = {
  nanoBanana: "google/nano-banana",
  nanoBananaPro: "google/nano-banana-pro",
  moondream2: "lucataco/moondream2:72ccb656353c348c1385df54b237eeb7bfa874bf11486cf0b9473e691b662d31"
} as const;