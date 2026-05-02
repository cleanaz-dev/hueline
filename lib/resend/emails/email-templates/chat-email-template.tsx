
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

// You can import this from your config, or keep it here
const LOGO_URL = "https://res.cloudinary.com/dmllgn0t7/image/upload/v1760295280/logo-2--increased-brightness_wdn9il.png";

interface ChatEmailProps {
  subject: string;
  body: string;
  attachmentUrl?: string;
}

export function ChatEmailTemplate({
  subject,
  body,
  attachmentUrl,
}: ChatEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>{subject}</Preview>

      <Body style={{ backgroundColor: "#f6f9fc", fontFamily: "sans-serif" }}>
        <Container style={{ backgroundColor: "#ffffff", margin: "0 auto", padding: "20px 0 48px", marginBottom: "64px" }}>
          
          {/* Logo Section */}
          <Section style={{ padding: "0 48px" }}>
            <Img src={LOGO_URL} alt="HueLine logo" width="100" height="30" />
          </Section>

          {/* Body Text */}
          <Section style={{ padding: "20px 48px" }}>
            <Text style={{ fontSize: "16px", color: "#333", lineHeight: "24px" }}>
              {/* Renders HTML safely if you send bold/links from your chat */}
              <div dangerouslySetInnerHTML={{ __html: body }} />
            </Text>
          </Section>

          {/* AI Generated Mockup */}
          {attachmentUrl && (
            <Section style={{ padding: "0 48px 20px", textAlign: "center" }}>
              <Img
                src={attachmentUrl}
                alt="Your AI Mockup"
                style={{
                  width: "100%",
                  maxWidth: "600px",
                  borderRadius: "8px",
                  border: "1px solid #e5e7eb",
                }}
              />
            </Section>
          )}

          <Hr style={{ borderColor: "#e6ebf1", margin: "20px 0" }} />
          
          {/* Footer */}
          <Text style={{ color: "#8898aa", fontSize: "12px", textAlign: "center" }}>
            © {new Date().getFullYear()} Hue-Line. All rights reserved.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

export default ChatEmailTemplate;