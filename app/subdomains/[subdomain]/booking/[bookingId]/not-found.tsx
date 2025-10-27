import React from "react";
import Image from "next/image";
import { headers } from 'next/headers'
import { getSubdomainData } from '@/lib/query';
import { AlertCircle } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

export default async function BookingNotFound() {

    // Extract subdomain from hostname
  const headersList = await headers();
  const hostname = headersList.get('host') || '';
  const subdomain = hostname.split('.')[0];
  
  // Fetch subdomain data
  const subDomainData = await getSubdomainData(subdomain);
  const logoUrl = subDomainData?.logo || '/images/logo-2--increased-brightness.png';
  const companyName = subDomainData?.companyName || 'Company';
  return (
    <ScrollArea className="h-screen">
      <div className="h-screen bg-gradient-to-b from-primary/15 via-secondary/05 to-primary/30">
        <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm">
          <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-center">
            <div className="flex items-center space-x-2">
              <Image
                src={logoUrl}
                alt="HueLine Logo"
                className="object-contain w-14 md:w-20"
                width={120}
                height={120}
              />
            </div>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-6 py-16">
          <div className="text-center space-y-8">
            <div className="flex justify-center">
              <div className="flex items-center justify-center h-24 w-24 rounded-full bg-primary/10 border-2 border-primary/20">
                <AlertCircle className="h-12 w-12 text-primary/60" />
              </div>
            </div>

            <div className="space-y-4">
              <h1 className="text-3xl md:text-4xl font-bold text-foreground">
                Booking Not Found
              </h1>
              <p className="text-lg text-muted-foreground max-w-lg mx-auto">
                The <span className="font-bold">{companyName}</span>  design report you&apos;re looking for doesn&apos;t exist or may have expired.
              </p>
            </div>

            <div className="bg-background/60 rounded-xl p-6 max-w-md mx-auto border border-primary/10">
              <p className="text-sm text-muted-foreground">
                Design reports are temporarily stored and may expire after a period of time. 
              
              </p>
            </div>
          </div>
        </main>
      </div>
    </ScrollArea>
  );
}