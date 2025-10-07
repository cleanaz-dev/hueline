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

const billingPortalUrl =
  "https://billing.stripe.com/p/login/aFaeVe9790w84JW5Jj1sQ00";

interface OnboardingEmailProps {
  username: string;
  useremail: string;
  company: string;
}

interface SubscriptionEmailProps {
  username: string;
  useremail: string;
  company: string;
  plan: string;
}

interface ClientIntakeProps {
  name: string;
  email: string;
  company: string;
  phone: string;
  features: string[];
  hours: string;
}

interface SubscriptionLinkProps {
  name: string;
  company: string;
  subLink: string;
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
          {/* ------ LOGO + COMPANY ------ */}
          <Section style={styles.logoSection}>
            <Row>
              <Column style={styles.logoColumn}>
                <Img
                  src="https://res.cloudinary.com/dmllgn0t7/image/upload/v1759537911/mini-logo_fnouu0.png"
                  alt="HueLine logo"
                  width="60"
                  height="60"
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

          {/* ------ BODY ------ */}
          <Heading style={styles.heading}>Welcome aboard, {username}!</Heading>
          <Text style={styles.text}>
            Thanks for completing your one-time setup with {useremail}. Your{" "}
            <strong>{company}</strong> voice-AI instance is now in progress—
            we&apos;ll let you know as soon as it&apos;s ready to review.
          </Text>
          <Text style={styles.text}>
            Once you&apos;re happy with how it works, that&apos;s when
            we&apos;ll move into a simple monthly plan. Until then, just sit
            back—we&apos;re handling the setup for you.
          </Text>

          {/* ------ EARLY CLIENT PERKS ------ */}
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

          {/* ------ ID CARD ------ */}
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
  plan,
}: SubscriptionEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>
        Your {company} {plan.toLowerCase()} subscription is active ✅
      </Preview>

      <Body style={styles.body}>
        <Container style={styles.container}>
          {/* ------  LOGO + COMPANY  ------ */}
          <Section style={styles.logoSection}>
            <Row>
              <Column style={styles.logoColumn}>
                <Img
                  src="https://res.cloudinary.com/dmllgn0t7/image/upload/v1759537911/mini-logo_fnouu0.png"
                  alt="Hue-Line logo"
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

          {/* ------  BODY CONTENT  ------ */}
          <Heading style={styles.heading}>
            You’re all set, {username}! 🎉
          </Heading>
          <Text style={styles.text}>
            Your <strong>{company}</strong> {plan.toLowerCase()} subscription is
            now active and will renew automatically. No action is
            needed—you&apos;re all set to keep using your AI assistant without
            interruption.
          </Text>

          {/* ------  CTA  ------ */}
          <Section style={styles.featureHighlight}>
            <Text style={styles.text}>
              💡 Bookmark this email! Use the link below anytime to manage your
              subscription, update billing info, or view invoices.
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

export function ClientIntakeEmail({
  name,
  email,
  company,
  phone,
  features,
  hours,
}: ClientIntakeProps) {
  const setupFeeUrl = "https://buy.stripe.com/test_7sYaEY6W83Zr8kQbfPgQE00";

  return (
    <Html>
      <Head />
      <Preview>Thanks for meeting with us, {name}! Here's what's next.</Preview>

      <Body style={styles.body}>
        <Container style={styles.container}>
          {/* ------ LOGO + COMPANY ------ */}
          <Section style={styles.logoSection}>
            <Row>
              <Column style={styles.logoColumn}>
                <Img
                  src="https://res.cloudinary.com/dmllgn0t7/image/upload/v1759537911/mini-logo_fnouu0.png"
                  alt="Hue-Line logo"
                  width="60"
                  height="60"
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

          {/* ------ BODY ------ */}
          <Heading style={styles.heading}>
            Thanks for meeting with us, {name}! 🎉
          </Heading>

          <Text style={styles.text}>
            It was great connecting with you and learning more about{" "}
            <strong>{company}</strong>. Here's a quick recap of what we
            discussed and what happens next.
          </Text>

          {/* ------ PROJECT SUMMARY ------ */}
          <Section style={styles.summarySection}>
            <Heading as="h4" style={styles.summaryHeading}>
              Your Project Summary
            </Heading>

            <Text style={styles.summaryText}>
              Here&apos;s a quick recap of your AI setup for{" "}
              <strong>{company}</strong>.
            </Text>

            <Text style={styles.summaryText}>
              <strong>Key Features:</strong>
            </Text>

            <ul style={styles.intakeList}>
              {features.map((feature, index) => (
                <li key={index}> ✅ {feature}</li>
              ))}
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

          {/* ------ SETUP FEE CTA ------ */}
          <Section style={styles.featureHighlight}>
            <Heading as="h4" style={styles.subHeading}>
              🚀 Ready to Get Started?
            </Heading>
            <Text style={styles.text}>
              To kick things off, complete your one-time setup payment below.
              Once processed, we'll immediately begin building your custom AI
              solution.
            </Text>
            <Link href={setupFeeUrl} style={styles.primaryButton}>
              Complete Setup Payment
            </Link>
            <Text
              style={{
                ...styles.text,
                fontSize: "14px",
                color: "#666",
                marginTop: "12px",
              }}
            >
              💳 Secure payment via Stripe • One-time setup fee
            </Text>
          </Section>

          <Hr style={styles.hr} />

          <Text style={styles.footerText}>
            Questions before completing payment? Just hit reply or give me a
            call—I'm here to help. Looking forward to building something amazing
            for {company}!
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

export function SubscriptionLink({
  name,
  company,
  subLink,
}: SubscriptionLinkProps) {
  return (
    <Html>
      <Head /> <Preview>Finalize your Hue-Line subscription 🎯</Preview>
      <Body style={styles.body}>
        <Container style={styles.container}>
          {/* ------ LOGO + COMPANY ------ */}
          <Section style={styles.logoSection}>
            <Row>
              <Column style={styles.logoColumn}>
                <Img
                  src="https://res.cloudinary.com/dmllgn0t7/image/upload/v1759537911/mini-logo_fnouu0.png"
                  alt="Hue-Line logo"
                  width="60"
                  height="60"
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
          <Heading style={styles.heading}>You're almost live! 🚀</Heading>
          <Text style={styles.text}>
            Great news — your project for <strong>{company}</strong> is ready to
            go! The final step is to activate your subscription so we can move
            your Voice AI live.
          </Text>
          <Section style={styles.featureHighlight}>
            <Heading as="h4" style={styles.subHeading}>
              Activate Your Subscription
            </Heading>
            <Text style={styles.text}>
              Click below to complete your monthly subscription. Your email will
              be pre-filled for a faster checkout.
            </Text>
            <Link href={subLink} style={styles.primaryButton}>
              Activate Subscription
            </Link>
            <Text
              style={{
                ...styles.text,
                fontSize: "14px",
                color: "#666",
                marginTop: "10px",
              }}
            >
              💳 Secure checkout via Stripe
            </Text>
          </Section>
          <Text style={styles.footerText}>
            Once subscribed, your Voice AI will go live within 24 hours. If you
            have questions, just reply to this email.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}
