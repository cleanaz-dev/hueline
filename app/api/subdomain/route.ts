// app/api/subdomains/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const subdomains = await prisma.subdomain.findMany({
      select: {
        slug: true,
        companyName: true,
      },
      orderBy: {
        companyName: 'asc',
      },
    });

    return NextResponse.json(subdomains);
  } catch (error) {
    console.error('Error fetching subdomains:', error);
    return NextResponse.json(
      { error: 'Failed to fetch subdomains' },
      { status: 500 }
    );
  }
}