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
  Row,
  Column,
} from "@react-email/components";
import { styles } from "./email-styles";


const billingPortalUrl = "https://billing.stripe.com/p/login/aFaeVe9790w84JW5Jj1sQ00"

interface OnboardingEmailProps {
  username: string;
  useremail: string;
  company: string;
}

interface SubscriptionEmailProps {
  username: string;
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

      <Body style={styles.body}>
        <Container style={styles.container}>
          {/* ------  LOGO + COMPANY ------ */}
          <Section style={styles.logoSection}>
            <Row>
              <Column style={styles.logoColumn}>
                <Img
                  src="https://res.cloudinary.com/dmllgn0t7/image/upload/v1759537911/mini-logo_fnouu0.png"
                  alt="HueLine logo"
                  width="70"
                  height="70"
                  style={styles.logo}
                />
              </Column>
              <Column style={styles.textColumn}>
                <Heading as="h3" style={styles.company}>
                  Hue-Line
                </Heading>
              </Column>
            </Row>
          </Section>

          {/* ------  BODY  ------ */}
          <Heading style={styles.heading}>Welcome aboard, {username}!</Heading>
          <Text style={styles.text}>
            Thanks for signing up with {useremail}. Your{" "}
            <strong>{company}</strong> voice-AI instance is already being
            built—we&apos;ll let you know as soon as it&apos;s ready.
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
            <Text style={styles.name}>Paul Hendricks</Text>
            <Text style={styles.title}> Hue-Line </Text>

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
            Have questions? Just hit reply or use the links above—I&apos;ll get
            back to you right away.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}


export function SubscriptionEmail({
  username,
  company,
}: SubscriptionEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Your {company} subscription is active ✅</Preview>

      <Body style={styles.body}>
        <Container style={styles.container}>
          {/* ------  LOGO + COMPANY ------ */}
          <Section style={styles.logoSection}>
            <Row>
              <Column style={styles.logoColumn}>
                <Img
                  src="https://res.cloudinary.com/dmllgn0t7/image/upload/v1759537911/mini-logo_fnouu0.png"
                  alt="HueLine logo"
                  width="70"
                  height="70"
                  style={styles.logo}
                />
              </Column>
              <Column style={styles.textColumn}>
                <Heading as="h3" style={styles.company}>
                  Hue-Line
                </Heading>
              </Column>
            </Row>
          </Section>

          {/* ------  BODY  ------ */}
          <Heading style={styles.heading}>
            You&apos;re all set, {username}! 🎉
          </Heading>
          <Text style={styles.text}>
            Your <strong>{company}</strong> subscription is now active and will
            renew automatically each month. No action is needed—you&apos;re all
            set to keep using your AI assistant without interruption.
          </Text>

          {/* ------  VALUE / CTA  ------ */}
          <Section style={styles.featureHighlight}>
            <Text style={styles.text}>
              💡 Bookmark this email! Use the link below anytime to manage your
              subscription, or update payment info.
            </Text>
            <Link href={billingPortalUrl} style={styles.primaryButton}>
              Manage Subscription
            </Link>
          </Section>

          <Hr style={styles.hr} />
          <Text style={styles.footerText}>
            A detailed receipt has been sent separately from Stripe for your
            records. Keep this email handy—you can manage everything from the
            link above anytime.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

