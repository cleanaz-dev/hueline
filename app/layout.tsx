import type { Metadata } from "next";
import { Geist_Mono, Roboto } from "next/font/google";
import "./globals.css";
import LogoImage from "@/public/images/url-image.png";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/next";
import { Toaster } from "sonner";
import { NextAuthSessionProvider } from "@/providers/session-provider";

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});
const roboto = Roboto({
  variable: "--font-roboto",
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "Hue-line | Voice AI Agent Assistant for Painters",
  description:
    "AI-powered voice assistant that helps painters with photo analysis, visual mockups, and smart estimates during customer calls.",
  icons: {
    icon: LogoImage.src,
    apple: LogoImage.src,
  },
  openGraph: {
    title: "Hueline - Voice AI Agent Assistant for Painters",
    description:
      "AI-powered voice assistant that helps painters with photo analysis, visual mockups, and smart estimates during customer calls.",
    images: [LogoImage.src],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${roboto.className} ${geistMono.variable} antialiased`}>
        <NextAuthSessionProvider>
          {" "}
          {children}
          <Toaster mobileOffset={{ bottom: "16px" }} position="bottom-center" />
          <SpeedInsights />
          <Analytics />
        </NextAuthSessionProvider>
      </body>
    </html>
  );
}
