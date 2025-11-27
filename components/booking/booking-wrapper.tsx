'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import BookingPage from '@/components/booking/booking-id-page'
import SplashScreen from '../ui/splash-screeen/splash-screen'

// Booking type definition
type PaintColor = {
  name: string;
  hex: string;
  ral: string;
  variant?: string;
};

type MockupUrl = {
  url: string;
  room_type: string;
  color: PaintColor;
};

type Booking = {
  name: string;
  prompt: string;
  original_images: string[];
  mockup_urls: MockupUrl[];
  paint_colors: PaintColor[];
  alternate_colors?: PaintColor[];
  summary: string;
  call_duration?: string;
  phone: string;
  dimensions?: string;
  booking_id?: string;
};
type Props = {
  booking: Booking
}

export default function BookingWrapper({ booking }: Props) {
  const [showSplash, setShowSplash] = useState(true)
  const [splashComplete, setSplashComplete] = useState(false)

  // Hide splash after ~2s
  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 2000)
    return () => clearTimeout(timer)
  }, [])

  const handleSplashEnd = () => {
    setShowSplash(false)
  }

  return (
    <>
      {(showSplash || !splashComplete) && (
        <motion.div
          initial={{ opacity: 1 }}
          animate={{ opacity: showSplash ? 1 : 0 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          onAnimationComplete={() => {
            if (!showSplash) {
              setSplashComplete(true)
            }
          }}
        >
          <SplashScreen onVideoEnd={handleSplashEnd} />
        </motion.div>
      )}

      {!showSplash && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, ease: "easeIn" }}
        >
          <BookingPage booking={booking} />
        </motion.div>
      )}
    </>
  )
}
