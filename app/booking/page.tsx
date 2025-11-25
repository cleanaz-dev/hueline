import { authOptions } from '@/lib/auth'
import { getServerSession } from 'next-auth'

export default async function Page() {
  const session = await getServerSession(authOptions);
  
  const sessionId = session?.user?.id;

  const calendlyLink = process.env.CALENDLY_LINK
  
  return (
    <main className="h-screen">
      <iframe
        src={`${calendlyLink}?utm_source=${sessionId || 'no-session'}`}
        width="100%"
        height="100%"
      />
    </main>
  )
}