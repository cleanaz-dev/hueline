// subdomains/[slug]/my-account/page.tsx
"use client";

import SettingsContent from "@/components/subdomains/settings/settings-content";
import SubdomainNav from "@/components/subdomains/layout/subdomain-nav";
import { useSettings } from "@/context/settings-context";
import { Loader2 } from "lucide-react";

export default function SettingsPage() {
  const { settings, isLoading, isPlanActive } = useSettings();

  if (isLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-gray-50">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!settings) return <div>Error loading settings</div>;

  return (
    <div className="h-full rounded-xl bg-gradient-to-br from-gray-50 via-gray-50 to-transparent">
      <SettingsContent />
    </div>
  );
}
