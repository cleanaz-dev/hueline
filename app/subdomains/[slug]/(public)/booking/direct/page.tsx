import type { Viewport } from 'next';
import CalEmbedDirect from './CalEmbedDirect'; // Adjust this import path to where you saved it

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1, 
  userScalable: false,
}

export default function DirectBookingPage() {
  const directLink = 'paul-bare-sales/hue-line-direct';

  return (
    <main className="min-h-screen bg-slate-50 py-12 px-4 flex justify-center">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4">
            Book Your Call
          </h1>
          <p className="text-slate-600">
            A quick zoom meeting to find out if Hue-Line fits your business.
          </p>
        </div>
        <div className="overflow-hidden">
          <CalEmbedDirect calLink={directLink} />
        </div>
      </div>
    </main>
  );
}