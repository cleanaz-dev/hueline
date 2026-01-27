// app/post-session/schedule/page.tsx
import { authOptions } from '@/lib/auth'
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation' // Optional: if you want to protect the route

export default async function SchedulePage() {
  const session = await getServerSession(authOptions);
  
  // Optional: Redirect if not logged in
  if (!session) {
    // redirect('/login') 
  }

  const sessionId = session?.user?.id;
  const calendlyLink = process.env.CALENDLY_LINK;

  if (!calendlyLink) {
    return <div>Configuration error: Missing Calendar Link</div>;
  }

  return (
    <main className="h-screen w-full overflow-hidden bg-white">
      <iframe
        src={`${calendlyLink}?utm_source=${sessionId || 'guest'}&hide_event_type_details=1&hide_gdpr_banner=1`}
        width="100%"
        height="100%"
        frameBorder="0"
        title="Schedule an Appointment"
        allowFullScreen
      />
    </main>
  )
}