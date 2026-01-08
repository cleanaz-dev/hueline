// components/ui/secure-image.tsx
import { useState, useEffect } from "react";
import { Loader2, ImageOff } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface SecureImageProps {
  storageKey: string;
  alt: string;
  className?: string;
}

export const SecureImage = ({ storageKey, alt, className }: SecureImageProps) => {
  const [src, setSrc] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const fetchUrl = async () => {
      try {
        setLoading(true);
        // Reuse your existing signing endpoint
        const res = await fetch(`/api/storage/sign?key=${encodeURIComponent(storageKey)}`);
        
        if (!res.ok) throw new Error("Failed to sign");
        
        const data = await res.json();
        
        if (isMounted && data.url) {
          setSrc(data.url);
        } else {
          setError(true);
        }
      } catch (e) {
        if (isMounted) setError(true);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    if (storageKey) fetchUrl();

    return () => { isMounted = false; };
  }, [storageKey]);

  if (error) {
    return (
      <div className={cn("flex items-center justify-center bg-gray-100 text-gray-400", className)}>
        <ImageOff size={16} />
      </div>
    );
  }

  if (loading || !src) {
    return (
      <div className={cn("flex items-center justify-center bg-gray-100", className)}>
        <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className={cn("relative overflow-hidden", className)}>
      <Image 
        src={src} 
        alt={alt} 
        fill 
        className="object-cover"
        sizes="(max-width: 768px) 100px, 200px" // Optimization for performance
      />
    </div>
  );
};