
"use client";

import { useEffect } from 'react';
import Cal, { getCalApi } from "@calcom/embed-react";

interface CalEmbedProps {
  calLink: string;
  name: string;
}

export default function CalEmbed({ calLink, name }: CalEmbedProps) {
  useEffect(() => {
    (async function () {
      const cal = await getCalApi({});
      
      cal("ui", {
        styles: { branding: { brandColor: "#6366f1" } }, // Your primary color
        hideEventTypeDetails: false,
        layout: "column_view"
      });
    })();
  }, []);

  return (
    // 1. Removed fixed h-[700px] and overflow-hidden so the container can grow naturally
    <div className="">
      <Cal 
        calLink={calLink}
        // 2. Removed overflow: "scroll" to prevent the double scrollbar issue
        style={{ width: "100%", height: "100%" }}
        config={{
          name: name,
        }}
      />
    </div>
  );
}