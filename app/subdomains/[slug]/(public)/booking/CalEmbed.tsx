"use client";

import { useEffect, useMemo } from 'react';
import Cal, { getCalApi } from "@calcom/embed-react";

interface CalEmbedProps {
  calLink: string;
  name?: string;
  phone?: string;
  huelineId?: string;
}

export default function CalEmbed({ calLink, name, phone, huelineId }: CalEmbedProps) {
  // 1. Create a unique namespace (e.g., 'paulbaresaleshuelinedirect') to prevent Cal.com cache collisions
  const embedNamespace = useMemo(() => {
    return calLink.replace(/[^a-zA-Z0-9]/g, '');
  }, [calLink]);

  useEffect(() => {
    (async function () {
      // 2. Initialize using the unique dynamic namespace
      const cal = await getCalApi({ namespace: embedNamespace });
      cal("ui", {
        styles: { branding: { brandColor: "#6366f1" } },
        hideEventTypeDetails: false,
        layout: "column_view"
      });
    })();
  }, [embedNamespace]); // 3. Re-run if the namespace ever changes

  const config = name || phone || huelineId ? {
    ...(name && { name }),
    ...(huelineId && { huelineId }),
    ...(phone && { attendeePhoneNumber: phone }),
  } : undefined;

  return (
    <div className="w-full min-h-150">
      <Cal
        namespace={embedNamespace}
        calLink={calLink}
        style={{ width: "100%", minHeight: "600px" }}
        config={config}
      />
    </div>
  );
}