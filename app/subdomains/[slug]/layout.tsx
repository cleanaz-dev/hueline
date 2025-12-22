// app/subdomains/[slug]/layout.tsx

import { Metadata } from 'next';
import { getSubDomainAccount } from '@/lib/prisma';
import { cache } from 'react';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config'; 

import SuperAdminSidebar from '@/components/admin/super-admin-sidebar';
import { SuperAdminProvider } from '@/context/super-admin-context';

interface Props {
  params: Promise<{ slug: string }>;
  children: React.ReactNode;
}

const getSubdomainData = cache(async (slug: string) => {
  return await getSubDomainAccount(slug);
});

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const subData = await getSubdomainData(slug);
  
  if (!subData) {
    return {
      title: 'Design Report',
      description: 'View your personalized design mockup'
    };
  }
  
  return {
    title: `${subData.slug} Design Studio`,
    description: `Personalized paint and design services from ${subData.slug}`,
    openGraph: {
      title: `${subData.slug} Design Studio`,
      description: `Professional paint design mockups and color consultation`,
      images: [subData.logo || '/default-og-image.jpg'],
      siteName: subData.slug,
    },
    twitter: {
      card: 'summary_large_image',
      title: `${subData.slug} Design Studio`,
      description: `Professional paint design mockups`,
      images: [subData.logo || '/default-og-image.jpg'],
    }
  };
}

export default async function SubDomainLayout({ children }: Props) {
  const session = await getServerSession(authOptions);
  const isSuperAdmin = session?.role === 'SUPER_ADMIN';

  // REMOVED <NextAuthSessionProvider> WRAPPER HERE
  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/15 via-secondary/05 to-primary/30">
      {isSuperAdmin ? (
        <SuperAdminProvider>
          <div className="relative">
            <SuperAdminSidebar />
            <main className="lg:pl-64 min-w-0 w-full transition-all duration-300 overflow-x-hidden">
              <div className="p-4 lg:p-6 w-full h-full">
                {children}
              </div>
            </main>
          </div>
        </SuperAdminProvider>
      ) : (
        // Regular layout for normal users
        children
      )}
    </div>
  );
}