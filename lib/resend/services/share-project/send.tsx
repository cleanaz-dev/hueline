import { resend } from "@/lib/resend";
import { ShareProjectEmail } from "./send-share-project";

export async function sendShareProjectEmail(data: {
  email: string;
  senderName: string;
  projectName: string;
  message?: string;
}) {
  await resend.emails.send({
    from: "Origin Society <noreply@originsociety.ai>",
    to: data.email,
    subject: `${data.senderName} shared a project with you`,
    react: (
      <ShareProjectEmail
        senderName={data.senderName}
        projectName={data.projectName}
        message={data.message}
      />
    ),
  });
}
