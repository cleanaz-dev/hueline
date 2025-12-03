import Replicate from "replicate";

export const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

export const models = {
  nanoBanana: "google/nano-banana",
  nanoBananaPro: "google/nano-banana-pro",
} as const;