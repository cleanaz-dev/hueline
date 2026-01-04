import { verifySubdomainOwner } from "@/lib/auth";
import { checkSubdomainExists } from "@/lib/auth/guard/check-if-subdomain-exists";
import { redirect, notFound } from "next/navigation";
import AdminWrapper from "@/components/admin/admin-wrapper";

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function Page({ params }: PageProps) {
  const { slug } = await params;

  const exists = await checkSubdomainExists(slug);
  if (!exists) {
    redirect(`${process.env.NEXTAUTH_URL}/login`);
  }

  const session = await verifySubdomainOwner(slug);

  // Only SUPER_ADMIN with admin subdomain can access this page
  if (session?.role === "SUPER_ADMIN" && session.user.subdomainSlug === "admin") {
    return <AdminWrapper />;
  }

  // If user is OWNER or any other role, redirect to /my/dashboard
  if (session?.role === "OWNER") {
    redirect("/my/dashboard");
  }

  // If no valid session or unauthorized role, redirect to login
  redirect(`${process.env.NEXTAUTH_URL}/login`);
}