import {
  Html,
  Head,
  Preview,
  Body,
  Container,
  Text,
  Section,
  Img,
  Hr,
} from "@react-email/components";
import { styles } from "../../config";
import { LOGO_URL } from "@/lib/resend/config";

interface ChatEmailTemplateProps {
  subject: string;
  body: string;
  attachmentUrl?: string; // The presigned URL or direct image link
}

export async function SendChatEmail({
  subject,
  body,
  attachmentUrl,
}: ChatEmailTemplateProps) {
  return (
    <Html>
      <Head />
      <Preview>{subject}</Preview>
      <Body style={styles.body}>
        <Container style={styles.container}>
          <Section style={styles.logoSection}>
            <Img
              src={LOGO_URL}
              width="120"
              style={styles.logo}
              alt="Hue-Line Logo"
            />
          </Section>

          {/* Chat Message Text */}
          <Section style={{ padding: "20px 0" }}>
            {/* Using dangerouslySetInnerHTML if you send bold/italic HTML from chat, 
                otherwise standard <Text>{body}</Text> is safer */}
            <Text
              style={{ fontSize: "16px", color: "#333", lineHeight: "24px" }}
            >
              <div dangerouslySetInnerHTML={{ __html: body }} />
            </Text>
          </Section>

          {/* The AI Generated Mockup */}
          {attachmentUrl && (
            <Section style={{ paddingBottom: "20px", textAlign: "center" }}>
              <Img
                src={attachmentUrl}
                alt="Your New House Mockup"
                style={{
                  width: "100%",
                  maxWidth: "600px",
                  borderRadius: "8px",
                  border: "1px solid #e5e7eb",
                }}
              />
            </Section>
          )}

          <Hr style={styles.hr} />

          <Text
            style={{ fontSize: "12px", color: "#888", textAlign: "center" }}
          >
            © {new Date().getFullYear()} Hue-Line. All rights reserved.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}
