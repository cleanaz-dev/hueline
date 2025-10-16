// lib/config/stripe-config.tsx
export const StripePaymentLinks = {
  oneTimeSetupFee: "https://buy.stripe.com/14AeVe4QTgv63FSefP1sQ01",
  monthlyPlan: "https://buy.stripe.com/aFaeVe9790w84JW5Jj1sQ00",
  yearlyPlan: "https://buy.stripe.com/4gMdRa0AD0w8dgs3Bb1sQ02",
  customerPortal: "https://billing.stripe.com/p/login/aFaeVe9790w84JW5Jj1sQ00"
} as const;

export const StripeSandBoxLinks = {
  oneTimeSetupFee: "",
  monthlyPlan: "",
  yearlyPlan: "",
}