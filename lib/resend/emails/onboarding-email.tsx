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

export interface OnboardingEmailProps {
  username: string;
  useremail: string;
  company: string;
}

// After One-Time Setup Fee
export function OnboardingEmail({
  username,
  useremail,
  company,
}: OnboardingEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Welcome to Hue-Line! You're all set! 🎉</Preview>

      <Body style={styles.body}>
        <Container style={styles.container}>
          <LogoSection />

          <Heading style={styles.heading}>Welcome aboard, {username}! 🚀</Heading>
          <Text style={styles.text}>
            Thanks for completing your one-time setup fee for <strong>{company}</strong>. 
            We are absolutely thrilled to welcome you to the Hue-Line family and can&apos;t wait to build your custom Voice AI.
          </Text>
          <Text style={styles.text}>
            We build your AI specifically for your business. Once we have your requirements, we&apos;ll handle all the heavy lifting to build, train, and test it. You won&apos;t move into a monthly plan until you&apos;ve tested the final product and love it.
          </Text>

          <Section style={styles.featureHighlight}>
            <Heading as="h4" style={styles.subHeading}>
              📋 What&apos;s your next step?
            </Heading>
            <Text style={styles.text}>
              To get the ball rolling, we need to know exactly how you want your AI to behave. 
              <strong> If you haven&apos;t already, please complete your intake form or book your kickoff call with us.</strong>
            </Text>
          </Section>

          <Section style={styles.perksSection}>
            <Heading as="h4" style={styles.subHeading}>
              🎁 Early Client Perks:
            </Heading>
            <ul style={styles.perksList}>
              <li>Direct access to support by phone whenever you need</li>
              <li>1 year of full support included</li>
              <li>Free consultations on new tech and features</li>
              <li>Priority input on how Hue-Line evolves</li>
            </ul>
          </Section>

          <Section style={styles.idCard}>
            <Img
              src={AVATAR_URL}
              alt="Paul Hendricks"
              width={80}
              height={80}
              style={styles.avatar}
            />
            <Text style={styles.name}>Paul Hendricks</Text>
            <Text style={styles.title}>Hue-Line</Text>

            <Section style={styles.contactRow}>
              <Link href="tel:+12267902753" style={styles.contactLink}>
                Tel: +1 (226) 790-2753
              </Link>
              <Link href="mailto:paul@hue-line.com" style={styles.contactLink}>
                Email: paul@hue-line.com
              </Link>
            </Section>
          </Section>

          <Hr style={styles.hr} />
          <Text style={styles.footerText}>
            Have questions? Just hit reply or use the links above—we&apos;ll get
            back to you right away.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}