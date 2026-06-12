// src/emails/hue-claw-email-template.tsx
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

const LOGO_URL = "https://res.cloudinary.com/dmllgn0t7/image/upload/v1760295280/logo-2--increased-brightness_wdn9il.png";

export function HueClawEmailTemplate({
  subject,
  body,
}: {
  subject: string;
  body: string;
}) {
  return (
    <Html>
      <Head />
      <Preview>{subject}</Preview>
      <Body style={{ backgroundColor: "#f6f9fc", fontFamily: "sans-serif" }}>
        <Container
          style={{
            backgroundColor: "#ffffff",
            margin: "0 auto",
            padding: "20px 0 48px",
            marginBottom: "64px",
          }}
        >
          {/* Logo */}
          <Section style={{ padding: "0 48px" }}>
            <Img src={LOGO_URL} alt="HueLine logo" width="100" height="30" />
          </Section>

          {/* Body text */}
          <Section style={{ padding: "20px 48px" }}>
            <Text
              style={{
                fontSize: "16px",
                color: "#333",
                lineHeight: "24px",
              }}
            >
              <div dangerouslySetInnerHTML={{ __html: body }} />
            </Text>
          </Section>

          <Hr style={{ borderColor: "#e6ebf1", margin: "20px 0" }} />

          {/* Footer */}
          <Text
            style={{ color: "#8898aa", fontSize: "12px", textAlign: "center" }}
          >
            © {new Date().getFullYear()} Hue-Line. All rights reserved.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

