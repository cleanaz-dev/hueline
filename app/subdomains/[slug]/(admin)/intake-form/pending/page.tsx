import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { format } from "date-fns"; // Optional: to format dates cleanly

export default async function PendingFormsPage() {
  // 1. Correct Prisma Query: Find forms where the client is pending
  const pendingForms = await prisma.formData.findMany({
    where: {
      client: {
        status: "PENDING_INTAKE",
      },
    },
    include: {
      client: true, // Includes the Stripe/Client data so we can display it
    },
    orderBy: {
      createdAt: "desc", // Newest at the top
    },
  });

  return (
    <div className="max-w-6xl mx-auto p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Pending Intake Forms</h1>
        <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold">
          {pendingForms.length} Pending
        </span>
      </div>

      {pendingForms.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center text-gray-500">
          🎉 No pending intakes! Everyone is onboarded.
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Client Info
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Paid Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stripe ID
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {pendingForms.map((form) => (
                <tr key={form.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900">
                      {form.name || form.client?.firstName || "Unknown Name"}
                    </div>
                    <div className="text-sm text-gray-500">{form.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {/* Native JS Date fallback if you don't use date-fns */}
                    {new Date(form.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-400">
                    {form.client?.stripeCustomerId || "No ID"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    {/* Link to your form editing page, passing the form.id */}
                    <Link
                      href={`/intake-form/pending/${form.id}`}
                      className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none"
                    >
                      Start Intake
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}