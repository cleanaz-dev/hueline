"use client";

import { PersonStanding, Users, Phone, Mail, Building2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import OwnerPageHeader from "@/components/owner/owner-page.header";
import { useOwner } from "@/context/owner-context";
import Link from "next/link";

export default function Page() {
  const {
    setAddCustomerDialogOpen,
    customers = [],
    isCustomersLoading,
  } = useOwner();

  if (isCustomersLoading)
    return (
      <div className="flex items-center justify-center h-full">
        <Spinner className="size-8 text-primary" />
      </div>
    );

  return (
    <main className="container max-w-7xl mx-auto px-4">
      <OwnerPageHeader
        title="Customers"
        description="Analyze conversations, manage customer communication"
        icon={<PersonStanding className="w-7 h-7 text-zinc-700" />}
        count={customers.length}
        countLabel="Customers"
        countIcon={<Users className="w-4 h-4 text-zinc-500" />}
        onAddClick={() => setAddCustomerDialogOpen(true)}
        addButtonLabel="Add Customer"
      />

      <div className="rounded-3xl border border-zinc-200 bg-white shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-zinc-50">
              <TableHead>Customer</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {customers.map((customer) => (
              <TableRow key={customer.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-zinc-100 border border-zinc-200 flex items-center justify-center text-sm font-semibold text-zinc-700">
                      {customer.name ? customer.name.charAt(0) : "U"}
                    </div>
                    <div>
                      <div className="font-medium text-zinc-900">
                        {customer.name}
                      </div>
                      <div className="text-xs text-zinc-500">
                        Customer ID #{customer.id}
                      </div>
                    </div>
                  </div>
                </TableCell>

                <TableCell>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm text-zinc-700">
                      <Mail className="w-3.5 h-3.5 text-zinc-400" />
                      {customer.email}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-zinc-700">
                      <Phone className="w-3.5 h-3.5 text-zinc-400" />
                      {customer.phone}
                    </div>
                  </div>
                </TableCell>

                <TableCell>
                  <div className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-700">
                    <Building2 className="w-3 h-3" />
                    {customer.customerType}
                  </div>
                </TableCell>

                <TableCell>
                  <div className="inline-flex items-center rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs font-medium">
                    {customer.status}
                  </div>
                </TableCell>

                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-lg"
                      asChild
                    >
                      <Link href={`/my/customers/${customer.id}`}>View</Link>
                    </Button>
                    <Button size="sm" className="rounded-lg">
                      Message
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}

            {!customers.length && (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center py-12 text-zinc-500"
                >
                  No customers found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </main>
  );
}
