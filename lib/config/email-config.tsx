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
import { StripePaymentLinks } from "@/lib/config/strilpe-config";

const LOGO_URL =
  "https://res.cloudinary.com/dmllgn0t7/image/upload/v1760295280/logo-2--increased-brightness_wdn9il.png";
const AVATAR_URL =
  "https://res.cloudinary.com/dmllgn0t7/image/upload/v1759892366/Generated_Image_October_07_2025_-_10_58PM_oiyrvu.png";

function LogoSection() {
  return (
    <Section style={styles.logoSection}>
      <Row>
        <Column>
          <Img
            src={LOGO_URL}
            alt="HueLine logo"
            width="100"
            height="30"
            style={styles.logo}
          />
        </Column>
      </Row>
    </Section>
  );
}

interface ClientConfig {
  twilioNumber?: string;
  crm?: string;
  transferNumber?: string;
  subDomain?: string;
  voiceGender?: string;
  voiceName?: string;
  [key: string]: string | undefined;
}

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
  crm: string;
  config: ClientConfig;
}

interface SubscriptionLinkProps {
  name: string;
  company: string;
  email: string;
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

// Subscription Fee Paid
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
          <LogoSection />

          <Heading style={styles.heading}>
            You&apos;re all set, {username}! 🎉
          </Heading>
          <Text style={styles.text}>
            Your <strong>{company}</strong> {plan.toLowerCase()} subscription is
            now active and will renew automatically. No action is
            needed—you&apos;re all set to keep using your AI assistant without
            interruption.
          </Text>

          <Section style={styles.featureHighlight}>
            <Text style={styles.text}>
              💡 Bookmark this email! Use the link below anytime to manage your
              subscription, update billing info, or view invoices.
            </Text>
            <Link
              href={StripePaymentLinks.customerPortal}
              style={styles.primaryButton}
            >
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

// After Intake Form (Zoom)
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

// After Completing Working Voice Agent
export function SubscriptionLink({
  name,
  company,
  email,
}: SubscriptionLinkProps) {
  return (
    <Html>
      <Head />
      <Preview>Finalize your Hue-Line subscription 🎯</Preview>
      <Body style={styles.body}>
        <Container style={styles.container}>
          <LogoSection />

          <Heading style={styles.heading}>You&apos;re almost live! 🚀</Heading>
          <Text style={styles.text}>
            Hi {name}! Great news — your project for <strong>{company}</strong>{" "}
            is ready to go! The final step is to activate your subscription so
            we can move your Voice AI live.
          </Text>
          <Section style={styles.featureHighlight}>
            <Heading as="h4" style={styles.subHeading}>
              Activate Your Subscription
            </Heading>
            <Text style={styles.text}>
              Click below to complete your monthly subscription. Your email will
              be pre-filled for a faster checkout.
            </Text>
            <Link
              href={`${StripePaymentLinks.monthlyPlan}?prefilled_email=${encodeURIComponent(email)}`}
              style={styles.primaryButton}
            >
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