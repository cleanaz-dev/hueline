// app/subdomains/[slug]/layout.tsx

import { Metadata } from 'next';
import { getSubDomainAccount } from '@/lib/prisma';
import { cache } from 'react';

interface Props {
  params: Promise<{ slug: string }>;
  children: React.ReactNode;
}

const getSubdomainData = cache(async (slug: string) => {
  // Directly fetch from database without Redis caching
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

export default async function SubDomainLayout({children }: Props) {
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/15 via-secondary/05 to-primary/30">
      {children}
    </div>
  );
}