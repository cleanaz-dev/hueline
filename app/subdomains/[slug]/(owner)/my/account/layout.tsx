// subdomains/[slug]/my-account/layout.tsx

import { SettingsProvider } from "@/context/settings-context";

// 1. Define params as a Promise
interface SettingsLayoutProps {
  children: React.ReactNode;
  params: Promise<{ slug: string }>; 
}

// 2. Make the component async
export default async function SettingsLayout({
  children,
  params,
}: SettingsLayoutProps) {
  
  // 3. Await the params before using them
  const { slug } = await params; 

  return (
    <SettingsProvider slug={slug}>
      {children}
    </SettingsProvider>
  );
}