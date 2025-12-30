import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth"; 
import { redirect } from "next/navigation";
import { checkSubdomainExists } from "@/lib/auth/guard/check-if-subdomain-exists";
import AdminWrapper from "@/components/admin/admin-wrapper";

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function Page({ params }: PageProps) {
  const { slug } = await params;

  // 1. If subdomain doesn't exist, kill it.
  const exists = await checkSubdomainExists(slug);
  if (!exists) {
    redirect(`https://${process.env.NEXT_PUBLIC_APP_URL}/login`);
  }

  const session = await getServerSession(authOptions);

  // 2. ADMIN SUBDOMAIN (admin.hue-line.com)
  if (slug === "admin") {
    if (session?.role === "SUPER_ADMIN") {
      return <AdminWrapper />;
    }
    // If not super admin, get out.
    redirect(`https://${process.env.NEXT_PUBLIC_APP_URL}/login`);
  }

  // 3. OWNER REDIRECT (tenant.hue-line.com)
  // If the owner hits their root subdomain, push them to /my/dashboard immediately.
  if (
    session?.role === "OWNER" && 
    session.user.subdomainSlug === slug
  ) {
    redirect(`/my/dashboard`);
  }

  // 4. EVERYONE ELSE (Guests, logged out users, etc.)
  // There is NO dashboard page. Send them to login.
  redirect(`https://${process.env.NEXT_PUBLIC_APP_URL}/login`);
}