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
import { LogoSection } from "@/lib/config/email-config";
import { StripePaymentLinks } from "../config";

interface ActivateSubscriptionLinkProps {
  name: string;
  company: string;
  email: string;
}



// After Completing Working Voice Agent
export function ActivateSubscriptionLink({
  name,
  company,
  email,
}: ActivateSubscriptionLinkProps) {
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