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
  Row,
  Column,
} from "@react-email/components";

import { styles } from "@/lib/config/email-styles";
import { AVATAR_URL, LogoSection } from "@/lib/config/email-config";

export interface ClientConfig {
  twilioNumber?: string;
  crm?: string;
  transferNumber?: string;
  subDomain?: string;
  voiceGender?: string;
  voiceName?: string;
  [key: string]: string | undefined;
}

export interface ClientIntakeProps {
  name: string;
  email: string;
  company: string;
  phone: string;
  features: string[];
  hours: string;
  crm: string;
  config: ClientConfig;
}

export function ClientIntakeEmail({
  name,
  email,
  company,
  phone,
  features,
  hours,
  crm,
  config,
}: ClientIntakeProps) {
  return (
    <Html>
      <Head />
      <Preview>
        Thanks for meeting with us, {name}! Here&apos;s your AI blueprint.
      </Preview>

      <Body style={styles.body}>
        <Container style={styles.container}>
          <LogoSection />

          <Heading style={styles.heading}>
            We have your blueprint, {name}! 🏗️
          </Heading>

          <Text style={styles.text}>
            It was great connecting with you and learning exactly how we can help{" "}
            <strong>{company}</strong> grow. Here&apos;s a quick recap of everything
            we covered for your Voice AI build.
          </Text>

          <Section style={styles.featureHighlight}>
            <Heading as="h4" style={styles.subHeading}>
              What happens next? 🚀
            </Heading>
            <Text style={styles.text}>
              Our team is officially getting to work! ⏱ Please allow up to <strong>7 business days</strong> for us to build, train, and rigorously test your custom Voice AI. 
            </Text>
            <Text style={styles.text}>
              Once it&apos;s ready, we will send you a demo link to test it out yourself before we activate your monthly plan.
            </Text>
          </Section>

          <Section style={styles.summarySection}>
            <Heading as="h4" style={styles.summaryHeading}>
              Voice AI Configuration
            </Heading>

            <Text style={styles.summaryText}>
              <strong>Voice Settings:</strong>
            </Text>

            <ul style={styles.intakeList}>
              <li>
                <strong>Twilio Number:</strong> {config.twilioNumber}
              </li>
              <li>
                <strong>Transfer Number:</strong> {config.transferNumber}
              </li>
              <li>
                <strong>Voice Gender:</strong> {config.voiceGender}
              </li>
              <li>
                <strong>Voice Name:</strong> {config.voiceName}
              </li>
              <li>
                <strong>Subdomain:</strong> {config.subDomain}
              </li>
              <li>
                <strong>CRM:</strong> {crm}
              </li>
            </ul>

            {hours && (
              <Text style={styles.summaryText}>
                <strong>Business Hours:</strong> {hours} <br />
                <span style={{ fontSize: "14px", color: "#666" }}>
                  (Your Voice AI will only transfer calls during these hours)
                </span>
              </Text>
            )}
          </Section>

          {features && features.length > 0 && (
            <Section style={styles.summarySection}>
              <Heading as="h4" style={styles.summaryHeading}>
                Additional Features
              </Heading>
              <ul style={styles.intakeList}>
                {features.map((feature, index) => (
                  <li key={index}>✅ {feature}</li>
                ))}
              </ul>
            </Section>
          )}

          <Section style={{ marginTop: "24px" }}>
            <Heading as="h4" style={styles.subHeading}>
              Your Contact Info
            </Heading>
            <Text style={styles.summaryText}>
              <strong>Name:</strong> {name}
              <br />
              <strong>Email:</strong> {email}
              <br />
              <strong>Phone:</strong> {phone || "N/A"}
              <br />
              <strong>Company:</strong> {company}
              <br />
              <strong>CRM Platform:</strong> {crm}
            </Text>
          </Section>

          <Hr style={styles.hr} />

          <Text style={styles.footerText}>
            Questions? Just hit reply or give me a call—I&apos;m here to help.
            Looking forward to building something amazing for {company}!
          </Text>
        </Container>
      </Body>
    </Html>
  );
}
