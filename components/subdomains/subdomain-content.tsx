"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import SubDomainIdPage from "./subdomain-id-page";
import SubDomainSplashScreen from "./subdomain-splash-screen";
import { useBooking } from "@/context/booking-context";
import { getPublicUrl } from "@/lib/aws/cdn";

export function SubDomainContent() {
  const { booking, subdomain, isLoading } = useBooking();
  
  // Initialize splash state
  const [showSplash, setShowSplash] = useState(!!subdomain.splashScreen);
  const [minTimeElapsed, setMinTimeElapsed] = useState(false);

  // 1. Minimum timer to prevent flickering (1.5s)
  useEffect(() => {
    const timer = setTimeout(() => setMinTimeElapsed(true), 1500);
    return () => clearTimeout(timer);
  }, []);

  // 2. Hide splash only when timer is done AND video ended (if applicable)
  const handleSplashEnd = () => {
    setShowSplash(false);
  };

  // 3. Fallback: If no splash URL, hide after timer
  useEffect(() => {
    if (!subdomain.splashScreen && minTimeElapsed) {
      setShowSplash(false);
    }
  }, [minTimeElapsed, subdomain.splashScreen]);

  return (
    <>
      <AnimatePresence mode="wait">
        {/* Keep splash visible if timer hasn't ended OR data is still loading */}
        {(showSplash || (!minTimeElapsed && isLoading)) && subdomain.splashScreen ? (
          <motion.div
            key="splash"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className="fixed inset-0 z-50 bg-white"
          >
            <SubDomainSplashScreen
              onVideoEnd={handleSplashEnd} 
              // FIX: Add '|| ""' to ensure the type is always string
              splashScreenUrl={getPublicUrl(subdomain.splashScreen) || ""}
            />
          </motion.div>
        ) : null}
      </AnimatePresence>

      {/* Main Content */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: showSplash ? 0 : 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* 
           CRITICAL FIX: 
           We check !isLoading here. This ensures SubDomainIdPage (and the slider)
           is NOT mounted until the presigned URLs are actually ready.
        */}
        {!isLoading && (
          <SubDomainIdPage booking={booking} subdomain={subdomain} />
        )}
      </motion.div>
    </>
  );
}