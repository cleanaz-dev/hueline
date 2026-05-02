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

export const LOGO_URL =
  "https://res.cloudinary.com/dmllgn0t7/image/upload/v1760295280/logo-2--increased-brightness_wdn9il.png";
export const AVATAR_URL =
  "https://res.cloudinary.com/dmllgn0t7/image/upload/v1759892366/Generated_Image_October_07_2025_-_10_58PM_oiyrvu.png";

export function LogoSection() {
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


