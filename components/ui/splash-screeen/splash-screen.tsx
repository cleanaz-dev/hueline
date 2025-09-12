'use client'

import React, { useRef, useEffect } from 'react'

type SplashScreenProps = {
  onVideoEnd?: () => void
}

export default function SplashScreen({ onVideoEnd }: SplashScreenProps) {
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const video = videoRef.current
    
    if (video) {
      // Try to play the video
      video.play().catch((error) => {
        console.error('Video autoplay failed:', error)
        
        // If video fails to play, still call onVideoEnd after 3 seconds
        setTimeout(() => {
          if (onVideoEnd) {
            onVideoEnd()
          }
        }, 3000)
      })
    }
  }, [onVideoEnd])

  const handleVideoEnd = () => {
    if (onVideoEnd) {
      onVideoEnd()
    }
  }

  const handleVideoError = () => {
    console.error('Video failed to load')
    // If video has an error, call onVideoEnd after a short delay
    setTimeout(() => {
      if (onVideoEnd) {
        onVideoEnd()
      }
    }, 2000)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black">
      <video 
        ref={videoRef}
        className="w-full h-full object-cover"
        autoPlay 
        muted 
        playsInline
        onEnded={handleVideoEnd}
        onError={handleVideoError}
      >
        <source src="/videos/splash_screen.mp4" type="video/mp4" />
        
        {/* Fallback content if video doesn't load */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-white text-xl font-medium">
            Loading your design report...
          </div>
        </div>
      </video>
      
      {/* Loading text overlay - always visible */}
      <div className="absolute bottom-8 left-0 right-0 text-center">
        <div className="text-white text-lg font-light opacity-80">
          Preparing your personalized report
        </div>
      </div>
    </div>
  )
}