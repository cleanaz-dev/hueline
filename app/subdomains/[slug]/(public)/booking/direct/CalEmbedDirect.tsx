"use client";

import { useEffect } from 'react';
import Cal, { getCalApi } from "@calcom/embed-react";

interface CalEmbedDirectProps {
  calLink: string;
}

export default function CalEmbedDirect({ calLink }: CalEmbedDirectProps) {
  useEffect(() => {
    (async function () {
      // Hardcoded unique namespace for the direct page
      const cal = await getCalApi({ namespace: "direct" });
      cal("ui", {
        styles: { branding: { brandColor: "#6366f1" } },
        hideEventTypeDetails: false,
        layout: "column_view"
      });
    })();
  },[]);

  return (
    <div className="w-full min-h-150">
      <Cal
        namespace="direct"
        calLink={calLink}
        style={{ width: "100%", minHeight: "600px" }}
      />
    </div>
  );
}