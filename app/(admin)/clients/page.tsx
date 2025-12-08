import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import ClientPage from '@/components/admin/clients/client-page';
import { getBookingData } from '@/lib/prisma'
export default async function Clients() {
  const session = await getServerSession(authOptions);

  if (!session || session.user?.email !== process.env.ADMIN_EMAIL) {
    redirect('/login');
  }

  const bookingData = await getBookingData()

  return <ClientPage bookingData={bookingData} />;
}