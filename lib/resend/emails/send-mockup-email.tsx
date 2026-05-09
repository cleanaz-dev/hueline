import {
  Html, Head, Preview, Body, Container,
  Text, Section, Img, Hr,
} from "@react-email/components";
import { styles } from "../config";
import { LOGO_URL } from "@/lib/resend/config";

interface Colors {
  brand: string;
  code: string;
  hex: string;
  name: string;
}

export function SendMockUpEmail({
colors,
subject,
clientName,
body,
}: {
  colors: Colors;
  subject: string;
  body: string;
  clientName: string
}) {
  return (
    <Html>
      <Head />
      <Preview>{subject}</Preview>
      <Body style={styles.body}>
        <Container style={styles.container}>
          <Section style={styles.logoSection}>
            <Img src={LOGO_URL} width="120" style={styles.logo} alt="Hue-Line Logo" />
          </Section>
          <div dangerouslySetInnerHTML={{ __html: body }} />
          <Hr style={styles.hr} />
          <Text style={styles.footerText}>
            © {new Date().getFullYear()} Hue-Line. All rights reserved.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}