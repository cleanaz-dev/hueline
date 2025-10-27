//lib/handlers/client-intake-handlers.ts
import { transporter } from "../mailer";
import { render } from "@react-email/render";
import { ClientIntakeEmail } from "../config/email-config";
import { prisma } from "../prisma";

interface ClientConfig {
  twilioNumber?: string;
  transferNumber?: string;
  subDomain: string;
  voiceGender?: string;
  voiceName?: string;
  [key: string]: string | undefined;
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
    // Render the email template
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

    // Send email to the client
    await transporter.sendMail({
      from: '"Hue-Line" <info@hue-line.com>',
      to: data.email,
      subject: `Thanks for meeting with us, ${data.name}!`,
      html: emailHtml,
    });

    console.log(`✅ Client intake email sent to ${data.email}`);

    // Create Sub Domain Data
    const subdomain = await prisma.subdomain.create({
      data: {
        slug: data.config.subDomain,
        companyName: data.company,
      }
    });
    
    console.log(`✅ Created subdomain: ${subdomain.slug}`);
    
    return { success: true, subdomain };
  } catch (error) {
    console.error("❌ Error in client intake handler:", error);
    throw new Error("Failed to process client intake");
  }
}