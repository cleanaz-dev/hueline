import {
  Html,
  Head,
  Preview,
  Body,
  Container,
  Heading,
  Text,
  Section,
  Img,
  Hr,
} from "@react-email/components";
import { styles } from "../../config";
import { LOGO_URL, AVATAR_URL } from "@/lib/resend/config"; // optional

export function ShareProjectEmail({
  senderName,
  projectName,
  message,
}: {
  senderName: string;
  projectName: string;
  message?: string;
}) {
  return (
    <Html>
      <Head />
      <Preview>{senderName} shared a project with you</Preview>

      {/* BODY */}
      <Body style={styles.body}>
        <Container style={styles.container}>

          {/* Logo */}
          <Section style={styles.logoSection}>
            <Img src={LOGO_URL} width="120" style={styles.logo} alt="Origin Society Logo" />
          </Section>

          {/* Heading */}
          <Heading style={styles.heading}>
            📁 {projectName}
          </Heading>

          {/* Summary Text */}
          <Text style={styles.text}>
            <strong>{senderName}</strong> shared a project with you.
          </Text>

          {message && (
            <Text style={styles.text}>
              &quot;{message}&quot;
            </Text>
          )}

          <Hr style={styles.hr} />

          {/* CTA Button */}
          <Section style={styles.featureHighlight}>
            <Text style={styles.subHeading}>View the Project</Text>
            <a
              href="https://originsociety.ai"
              style={styles.primaryButton}
            >
              Open Project
            </a>
          </Section>

          <Hr style={styles.hr} />

          {/* Footer */}
          <Text style={styles.footerText}>
            © {new Date().getFullYear()} Origin Society. All rights reserved.
          </Text>

        </Container>
      </Body>
    </Html>
  );
}
