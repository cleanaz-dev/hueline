// app/api/test/email/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { render } from '@react-email/render';
import { transporter } from '@/lib/mailer';
import { OnboardingEmail, SubscriptionEmail } from '@/lib/config/email-config';

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Render both email templates
    const onboardingHtml = await render(
      OnboardingEmail({
        username: 'Test User',
        useremail: email,
        company: 'Test Company Inc.',
      })
    );

    const subscriptionHtml = await render(
      SubscriptionEmail({
        username: 'Test User',
        company: 'Test Company Inc.',
      })
    );

    // Send onboarding email
    const onboardingInfo = await transporter.sendMail({
      from: '"Hue-Line" <info@hue-line.com>',
      to: email,
      subject: 'Welcome to Hue-Line! (Test)',
      html: onboardingHtml,
    });

    // Send subscription email
    const subscriptionInfo = await transporter.sendMail({
      from: '"Hue-Line" <info@hue-line.com>',
      to: email,
      subject: 'Your Subscription is Active (Test)',
      html: subscriptionHtml,
    });

    return NextResponse.json({
      success: true,
      onboarding: { messageId: onboardingInfo.messageId },
      subscription: { messageId: subscriptionInfo.messageId },
    });
  } catch (error) {
    console.error('Email error:', error);
    return NextResponse.json(
      { error: error },
      { status: 500 }
    );
  }
}