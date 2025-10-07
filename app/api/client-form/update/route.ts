import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';


export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { email, company, phone, features, hours, name } = body;

    if (!email || !company || !phone || !name) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const form = await prisma.formData.upsert({
      where: { email },
      update: { company, phone, features, hours, name },
      create: { email, company, phone, features, hours, name },
    });
    
    return NextResponse.json({ success: true, data: form });
  } catch (err: any) {
    console.error('❌ Error saving form:', err);
    return NextResponse.json(
      { error: 'Failed to save form', details: err.message },
      { status: 500 }
    );
  }
}
