"use client";

import { useEffect } from 'react';
import Cal, { getCalApi } from "@calcom/embed-react";

interface CalEmbedProps {
  calLink: string;
  name?: string;
  phone?: string;
  huelineId?: string;
}

export default function CalEmbed({ calLink, name, phone, huelineId }: CalEmbedProps) {
  useEffect(() => {
    (async function () {
      // 1. Give the API call a specific namespace to prevent React strict-mode double-firing bugs
      const cal = await getCalApi({ namespace: "booking" });
      cal("ui", {
        styles: { branding: { brandColor: "#6366f1" } },
        hideEventTypeDetails: false,
        layout: "column_view"
      });
    })();
  },[]);

  const config = name || phone || huelineId ? {
    ...(name && { name }),
    ...(huelineId && { huelineId }),
    ...(phone && { attendeePhoneNumber: phone }),
  } : undefined;

  return (
    // 2. Add a minimum height constraint so the wrapper doesn't collapse to 0px
    <div className="w-full min-h-150">
      <Cal
        namespace="booking" // 3. Match the namespace here with the one in getCalApi
        calLink={calLink}
        // 4. Remove `height: "100%"` and replace with `minHeight` so the iframe can dynamically size itself
        style={{ width: "100%", minHeight: "600px" }}
        config={config}
      />
    </div>
  );
}