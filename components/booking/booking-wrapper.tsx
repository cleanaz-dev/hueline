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
  const [enrichedBooking, setEnrichedBooking] = useState<Booking>(booking)
  const [urlsReady, setUrlsReady] = useState(false)
  const [minTimeElapsed, setMinTimeElapsed] = useState(false)

  // Start fetching URLs immediately
  useEffect(() => {
    fetchPresignedUrls()
  }, [])

  // Minimum 2 second timer
  useEffect(() => {
    const timer = setTimeout(() => {
      setMinTimeElapsed(true)
    }, 2000)
    return () => clearTimeout(timer)
  }, [])

  // Hide splash only when BOTH conditions are met
  useEffect(() => {
    if (minTimeElapsed && urlsReady) {
      setShowSplash(false)
    }
  }, [minTimeElapsed, urlsReady])

  const fetchPresignedUrls = async () => {
    try {
      const res = await fetch(`/api/booking/${booking.phone}/get-presigned-urls`)
      if (!res.ok) throw new Error('Failed to fetch URLs')
      
      const { original_images, mockup_urls } = await res.json()
      
      setEnrichedBooking({
        ...booking,
        original_images,
        mockup_urls
      })
      setUrlsReady(true)
    } catch (error) {
      console.error('Failed to load presigned URLs:', error)
      setUrlsReady(true) // Still proceed to show the page
    }
  }

  return (
    <>
      {showSplash && (
        <motion.div
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
        >
          <SplashScreen onVideoEnd={() => {}} />
        </motion.div>
      )}

      {!showSplash && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, ease: "easeIn" }}
        >
          <BookingPage booking={enrichedBooking} />
        </motion.div>
      )}
    </>
  )
}