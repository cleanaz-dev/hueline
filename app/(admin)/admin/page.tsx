import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import CreateTenantForm from "@/components/admin/create-tenant-form";
import { Badge } from "@/components/ui/badge";

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions);

  // 🔒 SECURITY CHECK
  // Only allow if role is SUPER_ADMIN
  // @ts-ignore (if typescript complains about role)
  if (!session || session.role !== "SUPER_ADMIN") {
    return redirect("/login");
  }

  // Fetch all tenants
  const tenants = await prisma.subdomain.findMany({
    include: {
      users: true,
      bookings: { select: { id: true } }, // Count bookings
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Super Admin</h1>
          <div className="bg-white px-4 py-2 rounded-lg shadow-sm text-sm">
             Logged in as: <span className="font-bold">{session.user.email}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* LEFT: CREATE FORM */}
          <div className="md:col-span-1">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 sticky top-8">
              <h2 className="text-xl font-bold mb-4">Onboard Partner</h2>
              <CreateTenantForm />
            </div>
          </div>

          {/* RIGHT: TENANT LIST */}
          <div className="md:col-span-2 space-y-4">
            <h2 className="text-xl font-bold">Active Tenants ({tenants.length})</h2>
            
            {tenants.map((tenant) => (
              <div key={tenant.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <div className="flex items-center gap-3">
                    <h3 className="font-bold text-lg">{tenant.companyName}</h3>
                    <Badge variant={tenant.active ? "default" : "destructive"}>
                      {tenant.active ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                  <a 
                    href={`http://${tenant.slug}.hue-line.com`} // Adjust domain logic as needed
                    target="_blank" 
                    className="text-blue-600 text-sm hover:underline font-mono"
                  >
                    {tenant.slug}.hue-line.com
                  </a>
                  <div className="text-xs text-gray-500 mt-1">
                    Owner: {tenant.users[0]?.email || "No owner"}
                  </div>
                </div>

                <div className="flex items-center gap-8">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">{tenant.bookings.length}</div>
                    <div className="text-xs text-gray-500 uppercase font-bold">Bookings</div>
                  </div>
                  <div className="text-center">
                     <div className="text-2xl font-bold text-gray-900">{tenant.users.length}</div>
                     <div className="text-xs text-gray-500 uppercase font-bold">Users</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}