"use client";

import { useEffect } from 'react';
import Cal, { getCalApi } from "@calcom/embed-react";

interface CalEmbedProps {
  calLink: string;
  name: string;
  phone: string;
}

export default function CalEmbed({ calLink, name, phone }: CalEmbedProps) {
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

  return (
    <div className="">
      <Cal
        calLink={calLink}
        style={{ width: "100%", height: "100%" }}
        config={{
          name: name,
          email: "",
          attendeePhoneNumber: phone,
        }}
      />
    </div>
  );
}