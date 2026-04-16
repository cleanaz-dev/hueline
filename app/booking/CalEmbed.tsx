// app/booking/CalEmbed.tsx
"use client";

import { useEffect } from 'react';
import Cal, { getCalApi } from "@calcom/embed-react";
import { useRouter } from 'next/navigation';

interface CalEmbedProps {
  calLink: string;
}

export default function CalEmbed({ calLink }: CalEmbedProps) {
  const router = useRouter();

  useEffect(() => {
    (async function () {
      const cal = await getCalApi({});
      
      cal("ui", {
        styles: { branding: { brandColor: "#6366f1" } },
        hideEventTypeDetails: false,
        layout: "column_view"
      });

      cal("on", {
        action: "bookingSuccessful",
        callback: (e) => {
          // 1. Cast data to 'any' to bypass the TypeScript 'unknown' error
          const data = e.detail.data as any;
          
          // 2. Safely extract the name from the booking object
          const bookedName = 
            data?.booking?.responses?.name || 
            data?.booking?.attendees?.[0]?.name;
          
          if (bookedName) {
             router.push(`/thank-you?name=${encodeURIComponent(bookedName)}`);
          } else {
             router.push('/thank-you');
          }
        }
      });

    })();
  }, [router]);

  return (
    <div className="">
      <Cal 
        calLink={calLink}
        style={{ width: "100%", height: "100%" }}
      />
    </div>
  );
}