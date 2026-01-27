import { sgMail } from '../config';
import { render } from '@react-email/components';
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
import { styles } from "@/lib/resend/config"; // Import the styles
import { LOGO_URL } from "@/lib/resend/config"; // Import the logo URL (adjust path if needed)

interface SendShareProjectEmailParams {
  email: string;
  url: string;
  pin: string;
  accessType: 'customer' | 'viewer';
}

export async function sendShareProjectEmail({
  email,
  url,
  pin,
  accessType
}: SendShareProjectEmailParams) {
  
  // Convert "customer" to "Standard" for display
  const displayAccessType = accessType.toLowerCase() === 'customer' 
    ? 'Standard' 
    : accessType.charAt(0).toUpperCase() + accessType.slice(1);

  // Render your React Email component to HTML
  const emailHtml = await render(
    <Html>
      <Head />
      <Preview>A project has been shared with you</Preview>
      <Body style={styles.body}>
        <Container style={styles.container}>
          <Section style={styles.logoSection}>
            <Img src={LOGO_URL} width="120" style={styles.logo} alt="Hue-Line Logo" />
          </Section>
          <Text style={styles.text}>
            A project has been shared with you on Hue-Line.
          </Text>
          <Section style={{
            backgroundColor: '#f4f4f5',
            padding: '20px',
            borderRadius: '8px',
            marginTop: '16px',
            marginBottom: '16px'
          }}>
            <Text style={{ ...styles.text, margin: '0 0 12px 0' }}>
              <strong>Access Level:</strong> {displayAccessType}
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
            <Button href={url} style={styles.primaryButton}>
              View Project
            </Button>
          </Section>
          <Text style={{ ...styles.text, fontSize: '14px', color: '#666' }}>
            You&apos;ll need to enter the PIN above to access the project.
          </Text>
          <Hr style={styles.hr} />
          <Text style={styles.footerText}>
            © {new Date().getFullYear()} Hue-Line. All rights reserved.
          </Text>
        </Container>
      </Body>
    </Html>
  );

  const msg = {
    to: email,
    from: process.env.SENDGRID_FROM_EMAIL!,
    subject: `You've been invited to view a project`,
    html: emailHtml,
  };

  await sgMail.send(msg);
}