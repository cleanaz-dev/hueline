"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion"; // Import AnimatePresence
import SubDomainIdPage from "./subdomain-id-page";
import SubDomainSplashScreen from "./subdomain-splash-screen";
import { useBooking } from "@/context/booking-context";

export function SubDomainContent() {
  const { booking, subdomain } = useBooking();
  
  // Start true. If there is no splash video, we might want to flip this earlier.
  const [showSplash, setShowSplash] = useState(!!subdomain.splashScreen);
  const [minTimeElapsed, setMinTimeElapsed] = useState(false);

  // 1. Forced Branding Timer (Optional)
  // Even if data loads instantly, show logo for at least 1.5s so it doesn't flicker
  useEffect(() => {
    const timer = setTimeout(() => {
      setMinTimeElapsed(true);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  // 2. Dismiss Logic
  const handleSplashEnd = () => {
    setShowSplash(false);
  };

  // If there is no splash video url, we rely purely on the timer
  useEffect(() => {
    if (!subdomain.splashScreen && minTimeElapsed) {
      setShowSplash(false);
    }
  }, [minTimeElapsed, subdomain.splashScreen]);

  return (
    <>
      <AnimatePresence mode="wait">
        {showSplash && subdomain.splashScreen ? (
          <motion.div
            key="splash"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className="fixed inset-0 z-50 bg-white"
          >
            <SubDomainSplashScreen
              // Passing the callback ensures we wait for video/animation to finish
              onVideoEnd={handleSplashEnd} 
              splashScreenUrl={subdomain.splashScreen}
            />
          </motion.div>
        ) : null}
      </AnimatePresence>

      {/* Main Content - Always rendered in background or revealed after splash */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: showSplash ? 0 : 1 }}
        transition={{ duration: 0.5 }}
      >
        <SubDomainIdPage booking={booking} subdomain={subdomain} />
      </motion.div>
    </>
  );
}