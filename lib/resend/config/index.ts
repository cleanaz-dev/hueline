// lib / resend.ts
import { Resend } from 'resend';
export  {
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
export { styles } from "./styles"
export { StripePaymentLinks } from "@/lib/config/strilpe-config";

export const LOGO_URL =
  "https://res.cloudinary.com/dmllgn0t7/image/upload/v1764544174/url-image.png";
export const AVATAR_URL =
  "https://res.cloudinary.com/dmllgn0t7/image/upload/v1759892366/Generated_Image_October_07_2025_-_10_58PM_oiyrvu.png";

export const resend = new Resend(process.env.RESEND_API_KEY);