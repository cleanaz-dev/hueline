"use client"
import React, { useRef, useEffect } from 'react';

type SplashScreenProps = {
  onVideoEnd?: () => void;
};

export default function SplashScreen({ onVideoEnd }: SplashScreenProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;

    if (video) {
      video.play().catch((error) => {
        console.error('Video autoplay failed:', error);

        // If video fails to play, still call onVideoEnd after 3 seconds
        setTimeout(() => {
          if (onVideoEnd) {
            onVideoEnd();
          }
        }, 3000);
      });
    }
  }, [onVideoEnd]);

  const handleVideoEnd = () => {
    if (onVideoEnd) {
      onVideoEnd();
    }
  };

  const handleVideoError = () => {
    console.error('Video failed to load');
    // If video has an error, call onVideoEnd after a short delay
    setTimeout(() => {
      if (onVideoEnd) {
        onVideoEnd();
      }
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center ">
      <video
        ref={videoRef}
        className="w-full h-full object-cover md:object-contain"
        autoPlay
        muted
        playsInline
        preload='auto'
        onEnded={handleVideoEnd}
        onError={handleVideoError}
      >
        <source src="/videos/new-logo-splash-screen_1.mp4" type="video/mp4" />
      </video>
    </div>
  );
}