import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import { redirect } from "next/navigation";
import { ShieldAlert } from "lucide-react";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  // 🔒 DOUBLE SECURITY: Check here in the layout too
  // @ts-ignore
  if (!session || session.role !== "SUPER_ADMIN") {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Top Bar */}
      <header className="bg-gray-900 text-white p-4 shadow-md">
        <div className="max-w-6xl mx-auto flex items-center gap-2">
          <ShieldAlert className="text-red-500 w-5 h-5" />
          <span className="font-bold tracking-wide">HUE-LINE GOD MODE</span>
        </div>
      </header>
      
      {/* Page Content */}
      <main>{children}</main>
    </div>
  );
}