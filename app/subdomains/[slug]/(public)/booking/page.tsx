import type { Viewport } from 'next'
import CalEmbed from './CalEmbed';

// 👇 THIS IS THE MAGIC FIX FOR THE iOS ZOOM ISSUE
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1, 
  userScalable: false,
}

export default async function BookingPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const params = await searchParams;
  const name = typeof params.name === 'string' ? params.name : '';
  
  // Get the raw link from ENV or fallback
  const rawLink = process.env.NEXT_PUBLIC_CAL_LINK || 'paul-bare-sales/hue-line';
  
  // This cleans the link! If it sees "cal.com/", it removes it automatically.
  const cleanCalLink = rawLink.replace(/^(https?:\/\/)?(www\.)?cal\.com\//, '');

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
        <div className="overflow-hidden">
          <CalEmbed 
            calLink={cleanCalLink}
            name={name}
          />
        </div>
      </div>
    </main>
  )
}