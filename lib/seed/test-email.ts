// lib/seed/test-email.ts
import dotenv from 'dotenv';
import path from 'path'; // Add the missing path import
import { Resend } from "resend";

// 1. We use __dirname to ensure it always finds the root directory
// regardless of where you execute the script from.
// (Assuming this file is in /lib/seed/, so we go up two levels to the root)
const envPath = path.resolve(__dirname, '../../.env.local');

// 2. Load the environment variables
const envConfig = dotenv.config({ path: envPath });

if (envConfig.error) {
  console.warn(`⚠️ Warning: Could not find or load .env file at ${envPath}`);
}

// 3. Validate that the API key actually exists in the environment
const apiKey = process.env.RESEND_API_KEY;

if (!apiKey) {
  console.error("❌ ERROR: RESEND_API_KEY is missing. Please check your .env.local file.");
  process.exit(1); // Stop execution
}

// 4. Initialize Resend
const resend = new Resend(apiKey);

async function sendTestEmail() {
  console.log("Sending email...");
  
  const { data, error } = await resend.emails.send({
    from: "Hue-Line <info@hue-line.com>",
    to: "87hendricks@gmail.com", // change this
    subject: "Test Email - Resend Working!",
    html: "<h1>It works!</h1><p>Resend is configured correctly.</p>",
  });

  if (error) {
    console.error("❌ Failed:", error);
    return;
  }

  console.log("✅ Email sent successfully!", data);
}

sendTestEmail();