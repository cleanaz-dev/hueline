//lib/handlers/client-intake-handlers.ts
import { transporter } from "../mailer";
import { render } from "@react-email/render";
import { ClientIntakeEmail } from "../config/email-config";

interface ClientIntakeData {
  name: string;
  email: string;
  company: string;
  phone?: string;
  features: string[];
  hours?: string;
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
    
    return { success: true };
  } catch (error) {
    console.error("❌ Error sending client intake email:", error);
    throw new Error("Failed to send client intake email");
  }
}