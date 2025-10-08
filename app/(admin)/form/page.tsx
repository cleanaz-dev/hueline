import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import ClientFormPage from '@/components/admin/form/client-form-page';

export default async function FormPage() {
  const session = await getServerSession(authOptions);

  // 🔒 Only allow admin email to access
  if (!session || session.user?.email !== process.env.ADMIN_EMAIL) {
    redirect('/login');
  }

  return <ClientFormPage />;
}
