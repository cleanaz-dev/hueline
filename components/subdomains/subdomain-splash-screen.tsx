"use client";

import { useRef, useEffect, useState } from "react";
// ... keep your other imports

interface SubDomainSplashScreenProps {
  splashScreenUrl: string;
  onVideoEnd: () => void;
}

export default function SubDomainSplashScreen({
  splashScreenUrl,
  onVideoEnd,
}: SubDomainSplashScreenProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  
  // 1. Add a state to track if we are on the client
  const [isMounted, setIsMounted] = useState(false);

  // 2. Trigger mounting after the first render
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleVideoError = () => {
    console.error("Error playing splash screen video");
    onVideoEnd(); 
  };

  // 3. Render a static placeholder (or null) during server-side rendering
  // This prevents the mismatched attributes from being compared
  if (!isMounted) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white">
        {/* Optional: Add a spinner or loader here if you want */}
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white">
      <video
        ref={videoRef}
        className="w-full h-full object-contain"
        autoPlay
        muted
        playsInline
        onEnded={onVideoEnd}
        onError={handleVideoError}
      >
        {/* 
           The mismatch error happened here. 
           Now that we are inside the isMounted check, this only runs on the client.
        */}
        <source src={splashScreenUrl} type="video/mp4" />
      </video>
    </div>
  );
}