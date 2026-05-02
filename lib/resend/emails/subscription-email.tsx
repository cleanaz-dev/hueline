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
import { StripePaymentLinks } from "@/lib/config/strilpe-config";

export interface SubscriptionEmailProps {
  username: string;
  useremail: string;
  company: string;
  plan: string;
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