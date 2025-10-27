// app/subdomains/[subdomain]/layout.tsx

import { Metadata } from 'next';
import { getSubdomainData } from '@/lib/query';

interface Props {
  params: Promise<{ subdomain: string }>;
  children: React.ReactNode;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { subdomain } = await params;
  const subData = await getSubdomainData(subdomain);
  
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

export default function SubDomainLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <div>{children}</div>;
}