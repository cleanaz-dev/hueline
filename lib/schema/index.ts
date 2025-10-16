// lib/schema/index.ts
import { z } from "zod";

export const clientInformationSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  company: z.string().min(2, "Company name is required"),
  phone: z.string().min(1, "Phone number is required"),
  hours: z.string().optional(),
});

export const featuresSchema = z.object({
  twilioNumber: z.string().min(10, "Valid Twilio number is required"),
  crm: z.string().min(1, "CRM selection is required"),
  transferNumber: z.string().optional(),
  subDomain: z.string()
    .min(2, "Subdomain is required")
    .regex(/^[a-z0-9-]+$/, "Subdomain can only contain lowercase letters, numbers, and hyphens"),
  voiceGender: z.union([z.literal("male"), z.literal("female")]).refine(
    (val) => val === "male" || val === "female", 
    { message: "Voice gender is required" }
  ),
  voiceName: z.string().min(2, "Voice name is required"),
});

export const clientFormSchema = z.object({
  // Client Information
  ...clientInformationSchema.shape,
  // Features
  ...featuresSchema.shape,
  // Features array (separate from FeaturesList)
  features: z
    .array(z.string().min(1, "Feature cannot be empty"))
    .min(1, "At least one feature is required"),
});

export type ClientInformationData = z.infer<typeof clientInformationSchema>;
export type FeaturesData = z.infer<typeof featuresSchema>;
export type ClientFormData = z.infer<typeof clientFormSchema>;