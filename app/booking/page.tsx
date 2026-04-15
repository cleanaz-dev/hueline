// app/booking/page.tsx
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import type { Viewport } from 'next'
import CalEmbed from './CalEmbed';

// 👇 THIS IS THE MAGIC FIX FOR THE iOS ZOOM ISSUE
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1, // This prevents Safari from auto-zooming into the iframe inputs
  userScalable: false,
}

export default async function BookingPage() {
  const session = await getServerSession(authOptions);
  const sessionId = session?.user?.id || 'no-session';
  const name = session?.user?.name || '';
  const email = session?.user?.email || '';
  const calLink = process.env.NEXT_PUBLIC_CAL_LINK || '';

  return (
    <main className="min-h-screen bg-slate-50 py-12 px-4 flex justify-center">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4">
            Book Your Demo
          </h1>
          <p className="text-slate-600">
            Select a time below to see HUE-LINE in action.
          </p>
        </div>

        {/* The Client Component wrapper for Cal.com */}
        <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
          <CalEmbed 
            calLink={calLink} // <-- Change this to your Cal.com link (e.g., 'john/30min')
            name={name}
            email={email}
            sessionId={sessionId}
          />
        </div>
      </div>
    </main>
  )
}