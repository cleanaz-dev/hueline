"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import SubDomainIdPage from "./subdomain-id-page";
import SubDomainSplashScreen from "./subdomain-splash-screen";

// Booking type definition
type PaintColor = {
  name: string;
  hex: string;
  ral: string;
};

type Booking = {
  name: string;
  prompt: string;
  original_images: string[];
  mockup_urls: string[];
  paint_colors: PaintColor[]; // Array of paint color objects
  summary: string;
  phone: string
};

type Props = {
  booking: Booking;
  subdomain: SubDomainData;
};

interface SubDomainData {
  slug: string;
  projectUrl?: string;
  logo?: string;
  splashScreen?: string;
  theme?: {
    primaryColor?: string;
    secondaryColor?: string;
    font?: string;
    [key: string]: string | undefined;
  };
}

export function SubDomainWrapper({ booking, subdomain }: Props) {
  const [showSplash, setShowSplash] = useState(true);
  const [splashComplete, setSplashComplete] = useState(false);

  // Hide splash after ~2s
  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  const handleSplashEnd = () => {
    setShowSplash(false);
  };

  return (
    <>
      {(showSplash || !splashComplete) && (
        <motion.div
          initial={{ opacity: 1 }}
          animate={{ opacity: showSplash ? 1 : 0 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          onAnimationComplete={() => {
            if (!showSplash) {
              setSplashComplete(true);
            }
          }}
        >
          <SubDomainSplashScreen
            onVideoEnd={handleSplashEnd}
            splashScreenUrl={subdomain.splashScreen}
          />
        </motion.div>
      )}

      {!showSplash && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, ease: "easeIn" }}
        >
          <SubDomainIdPage booking={booking} subdomain={subdomain} />
        </motion.div>
      )}
    </>
  );
}
