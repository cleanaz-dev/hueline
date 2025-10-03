// lib/config/email-config.tsx
import {
  Html,
  Head,
  Preview,
  Body,
  Container,
  Heading,
  Text,
  Hr,
  Section,
  Img,
  Link,
  Button
} from "@react-email/components";

interface OnboardingEmailProps {
  username: string;
  useremail: string;
  company: string;
}

export function OnboardingEmail({
  username,
  useremail,
  company,
}: OnboardingEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>You&apos;re all set! 🎉</Preview>

      <Body style={{ margin: 0, padding: 0 }}>
        <Container style={styles.container}>
          {/* ------  LOGO + COMPANY  ------ */}
          <Section style={styles.logoWrapper}>
            <Img
              src="https://your-cdn.com/logo3.png" // ← your real logo URL
              alt="HueLine logo"
              width="40"
              height="40"
              style={styles.logo}
            />
            <Heading as="h3" style={styles.company}>
              Hue-Line
            </Heading>
          </Section>

          {/* ------  BODY  ------ */}
          <Heading style={styles.heading}>Welcome aboard, {username}!</Heading>
          <Text style={styles.text}>
            Thanks for signing up with {useremail}. Your{" "}
            <strong>{company}</strong> voice-AI instance is already being
            built—sit tight.
          </Text>
          <Text style={{ ...styles.text, ...styles.marginTop }}>
            We&apos;re already building your custom voice-AI—sit tight.
          </Text>

         
          {/* ------  ID CARD  ------ */}
          <Section style={styles.idCard}>
            <Img
              src="https://your-cdn.com/your-photo.jpg"
              alt="Your Name"
              width={80}
              height={80}
              style={styles.avatar}
            />
            <Text style={styles.name}>Your Name</Text>
            <Text style={styles.title}>Personal Assistant | {company}</Text>

            <Section style={styles.contactRow}>
              <Link href="tel:+12267902753" style={styles.contactLink}>
                📞 +1 (234) 567-8900
              </Link>
              <Link href="mailto:paul@hue-line.com" style={styles.contactLink}>
                ✉️ paul@hue-line.com
              </Link>
            </Section>

            {/* <Button href="https://wa.me/1234567890" style={styles.whatsapp}>
              Message on WhatsApp
            </Button> */}
          </Section>

          <Hr style={styles.hr} />
          <Text style={styles.footerText}>
            Questions? Hit reply or use the links above—I’ll answer ASAP.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

/* ----------------  STYLES  ---------------- */
const styles = {
  container: {
    padding: "20px",
    fontFamily: "Arial, sans-serif",
    backgroundColor: "#ffffff",
  },
  logoWrapper: {
    display: "flex",
    alignItems: "center",
    marginBottom: "24px",
  },
  logo: {
    borderRadius: "6px",
  },
  company: {
    margin: 0,
    marginLeft: "12px",
    fontSize: "20px",
    color: "#111827",
  },
  heading: {
    color: "#333333",
    fontSize: "24px",
    margin: "0 0 16px 0",
  },
  text: {
    color: "#666666",
    fontSize: "16px",
    lineHeight: 1.5,
    margin: "0 0 16px 0",
  },
  footerText: {
    color: "#666",
    fontSize: "12px",
  },
  hr: {
    margin: "30px 0",
    border: "none",
    borderTop: "1px solid #eaeaea",
  },
  marginTop: {
    marginTop: "20px",
  },
  idCard: {
    marginTop: "24px",
    border: "1px solid #e5e7eb",
    borderRadius: "12px",
    padding: "20px",
    textAlign: "center" as const,
    backgroundColor: "#f9fafb",
  },
  avatar: {
    borderRadius: "50%",
    margin: "0 auto 12px",
  },
  name: {
    fontSize: "18px",
    fontWeight: 600,
    color: "#111827",
    margin: 0,
  },
  title: {
    fontSize: "14px",
    color: "#6b7280",
    margin: "4px 0 12px",
  },
  contactRow: {
    margin: "12px 0",
  },
  contactLink: {
    fontSize: "14px",
    color: "#007acc",
    textDecoration: "none",
    display: "block",
    margin: "4px 0",
  },
  whatsapp: {
    marginTop: "12px",
    backgroundColor: "#25D366",
    color: "#ffffff",
    padding: "10px 16px",
    borderRadius: "6px",
    fontSize: "14px",
    textDecoration: "none",
    display: "inline-block",
  },
} as const;
