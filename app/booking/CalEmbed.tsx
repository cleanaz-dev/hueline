// app/booking/CalEmbed.tsx
"use client";

import { useEffect } from 'react';
import Cal, { getCalApi } from "@calcom/embed-react";

interface CalEmbedProps {
  calLink: string;
  name: string;
  email: string;
  sessionId: string;
}

export default function CalEmbed({ calLink, name, email, sessionId }: CalEmbedProps) {
  useEffect(() => {
    (async function () {
      const cal = await getCalApi({});
      
      // Customize the UI of the Cal.com embed
      cal("ui", {
        styles: { branding: { brandColor: "#6366f1" } }, // Matches your primary indigo color
        hideEventTypeDetails: false,
        layout: "month_view"
      });
    })();
  }, []);

  return (
    <div className="w-full h-[700px] overflow-hidden">
      <Cal 
        calLink={calLink}
        style={{ width: "100%", height: "100%", overflow: "scroll" }}
        
        // This pre-fills the user's data from Next-Auth so they don't have to type it!
        config={{
          name: name,
          email: email,
          metadata: {
            userId: sessionId // Passes your app's user ID into Cal.com for tracking
          }
        }}
      />
    </div>
  );
}