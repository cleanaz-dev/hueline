"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import SubDomainIdPage from "./subdomain-id-page";
import SubDomainSplashScreen from "./subdomain-splash-screen";
import { useBooking } from "@/context/booking-context";

export function SubDomainContent() {
  const { booking, subdomain, isLoading } = useBooking(); // Access data from Context
  
  const [showSplash, setShowSplash] = useState(true);
  const [minTimeElapsed, setMinTimeElapsed] = useState(false);

  // Minimum 2 second timer for splash
  useEffect(() => {
    const timer = setTimeout(() => {
      setMinTimeElapsed(true);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  // Hide splash only when BOTH conditions are met:
  // 1. Minimum time has passed
  // 2. Data is done loading (isLoading is false)
  useEffect(() => {
    if (minTimeElapsed && !isLoading) {
      setShowSplash(false);
    }
  }, [minTimeElapsed, isLoading]);

  const handleSplashEnd = () => {
    setShowSplash(false);
  };

  return (
    <>
      {showSplash && (
        <motion.div
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          // Ensure splash covers everything
          className="fixed inset-0 z-50 bg-white" 
        >
          {subdomain.splashScreen && (
            <SubDomainSplashScreen
              onVideoEnd={handleSplashEnd}
              splashScreenUrl={subdomain.splashScreen}
            />
          )}
        </motion.div>
      )}

      {!showSplash && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, ease: "easeIn" }}
        >
          {/* We don't need to pass props here anymore if SubDomainIdPage uses the hook,
              but we can pass them if SubDomainIdPage expects props. 
              Ideally, update SubDomainIdPage to use the hook too! */}
          <SubDomainIdPage booking={booking} subdomain={subdomain} />
        </motion.div>
      )}
    </>
  );
}