import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import ClientPage from '@/components/admin/client/client-page';


export default async function Clients() {
  const session = await getServerSession(authOptions);

  if (!session || session.user?.email !== process.env.ADMIN_EMAIL) {
    redirect('/login');
  }

  return <ClientPage />;
}
