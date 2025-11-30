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
  Button,
} from "@react-email/components";
import { styles } from "../../config";
import { LOGO_URL } from "@/lib/resend/config";

export function ShareProjectEmail({
  accessType,
  pin,
  bookingId,
}: {
  accessType: string;
  pin: string;
  bookingId: string;
}) {
  const projectUrl = `https://originsociety.ai/bookings/${bookingId}`;
  
  return (
    <Html>
      <Head />
      <Preview>A project has been shared with you</Preview>

      <Body style={styles.body}>
        <Container style={styles.container}>

          <Section style={styles.logoSection}>
            <Img src={LOGO_URL} width="120" style={styles.logo} alt="Origin Society Logo" />
          </Section>

          <Text style={styles.text}>
            A project has been shared with you on Origin Society.
          </Text>

          <Section style={{
            backgroundColor: '#f4f4f5',
            padding: '20px',
            borderRadius: '8px',
            marginTop: '16px',
            marginBottom: '16px'
          }}>
            <Text style={{ ...styles.text, margin: '0 0 12px 0' }}>
              <strong>Access Level:</strong> {accessType.charAt(0).toUpperCase() + accessType.slice(1)}
            </Text>
            <Text style={{ ...styles.text, margin: '0' }}>
              <strong>Access PIN:</strong> <span style={{ 
                fontSize: '24px', 
                fontWeight: 'bold',
                letterSpacing: '4px',
                color: '#000'
              }}>{pin}</span>
            </Text>
          </Section>

          <Section style={{ textAlign: 'center', marginTop: '24px', marginBottom: '24px' }}>
            <Button
              href={projectUrl}
              style={styles.primaryButton}
            >
              View Project
            </Button>
          </Section>

          <Text style={{ ...styles.text, fontSize: '14px', color: '#666' }}>
            You'll need to enter the PIN above to access the project.
          </Text>

          <Hr style={styles.hr} />

          <Text style={styles.footerText}>
            © {new Date().getFullYear()} Origin Society. All rights reserved.
          </Text>

        </Container>
      </Body>
    </Html>
  );
}