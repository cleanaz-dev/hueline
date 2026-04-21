// lib/handlers/client-intake-handlers.ts
import { Resend } from "resend";
import { render } from "@react-email/render";
import { ClientIntakeEmail } from "../config/email-config";

const resend = new Resend(process.env.RESEND_API_KEY);

interface ClientConfig {
  twilioNumber?: string;
  transferNumber?: string;
  subDomain: string;
  voiceGender?: string;
  voiceName?: string;
  [key: string]: any;
}

interface ClientIntakeData {
  name: string;
  email: string;
  company: string;
  phone?: string;
  features: string[];
  hours?: string;
  crm: string;
  config: ClientConfig;
}

export async function clientIntakeHandler(data: ClientIntakeData) {
  try {
    const emailHtml = await render(
      ClientIntakeEmail({
        name: data.name,
        email: data.email,
        company: data.company,
        phone: data.phone || "",
        features: data.features,
        hours: data.hours || "",
        crm: data.crm || "",
        config: data.config,
      })
    );

    const { error } = await resend.emails.send({
      from: "Hue-Line <info@hue-line.com>",
      to: data.email,
      subject: `Thanks for meeting with us, ${data.name}!`,
      html: emailHtml,
    });

    if (error) {
      throw new Error(`Resend error: ${error.message}`);
    }

    console.log(`✅ Client intake email sent to ${data.email}`);

    return { success: true };
  } catch (error) {
    console.error("❌ Error in client intake handler:", error);
    throw new Error("Failed to process client intake");
  }
}