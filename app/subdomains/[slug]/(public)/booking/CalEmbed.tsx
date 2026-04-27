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
      const cal = await getCalApi({});
      cal("ui", {
        styles: { branding: { brandColor: "#6366f1" } },
        hideEventTypeDetails: false,
        layout: "column_view"
      });
    })();
  }, []);

const config = name || phone || huelineId ? {
    ...(name && { name }),
    ...(huelineId && { huelineId }),
    ...(phone && { attendeePhoneNumber: phone }),
  } : undefined;

  return (
    <div className="">
      <Cal
        calLink={calLink}
        style={{ width: "100%", height: "100%" }}
        config={config}
      />
    </div>
  );
}