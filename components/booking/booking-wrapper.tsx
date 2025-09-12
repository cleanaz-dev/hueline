'use client'

import React, { useState, useEffect } from 'react'
import { getBooking } from "@/lib/redis"
import BookingPage from '@/components/booking/booking-id-page'
import SplashScreen from '../ui/splash-screeen/splash-screen'

// Booking type definition
type Booking = {
  name: string
  prompt: string
  original_images: string[]
  mockup_urls: string[]
  paint_colors: string[]
  summary: string
}

type Props = {
  params: Promise<{
    bookingId: string
  }>
}

export default function BookingWrapper({ params }: Props) {
  // State management
  const [showSplash, setShowSplash] = useState(true)
  const [booking, setBooking] = useState<Booking | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load booking data
  useEffect(() => {
    async function loadBooking() {
      try {
        const { bookingId } = await params
        const bookingData = await getBooking(bookingId)
        
        if (!bookingData) {
          setError(`Booking not found: ${bookingId}`)
        } else {
          setBooking(bookingData)
        }
      } catch (err) {
        console.error('Error loading booking:', err)
        setError('Failed to load booking')
      } finally {
        setLoading(false)
      }
    }

    loadBooking()
  }, [params])

  // Fallback timer - hide splash after 5 seconds even if video doesn't end
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false)
    }, 5000)

    return () => clearTimeout(timer)
  }, [])

  // Handle when splash screen should end
  const handleSplashEnd = () => {
    setShowSplash(false)
  }

  // Show splash screen while active
  if (showSplash) {
    return <SplashScreen onVideoEnd={handleSplashEnd} />
  }

  // Show loading if data still loading
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading your design report...</div>
      </div>
    )
  }

  // Show error if something went wrong
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-red-500">{error}</div>
      </div>
    )
  }

  // Show the main booking page
  return <BookingPage booking={booking!} />
}