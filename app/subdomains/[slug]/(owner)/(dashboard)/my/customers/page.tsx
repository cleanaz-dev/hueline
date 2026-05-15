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
import OwnerPageHeader from "@/components/owner/owner-page.header";
import { useOwner } from "@/context/owner-context";

export default function Page() {

  const { setAddCustomerDialogOpen } = useOwner()
  // temp mock data until API is connected
  const customers = [
    {
      id: "1",
      name: "John Smith",
      email: "john@example.com",
      phone: "(555) 123-4567",
      type: "RESIDENTIAL",
      status: "PENDING",
    },
    {
      id: "2",
      name: "Sarah Johnson",
      email: "sarah@example.com",
      phone: "(555) 987-6543",
      type: "COMMERCIAL",
      status: "BOOKED",
    },
  ];

  return (
    <main className="container max-w-6xl mx-auto px-4">
      {/* Header */}
      <OwnerPageHeader
        title="Customers"
        description="Analyze conversations, manage customer communication,
                  generate AI images, and monitor project activity."
        icon={<PersonStanding className="w-7 h-7 text-zinc-700" />}
        count={customers.length}
        countLabel="Customers"
        countIcon={<Users className="w-4 h-4 text-zinc-500" />}
        onAddClick={() => setAddCustomerDialogOpen(true)}
        addButtonLabel="Add Customer"
      />

      {/* Table */}
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
                {/* Name */}
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-zinc-100 border border-zinc-200 flex items-center justify-center text-sm font-semibold text-zinc-700">
                      {customer.name.charAt(0)}
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

                {/* Contact */}
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

                {/* Type */}
                <TableCell>
                  <div className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-700">
                    <Building2 className="w-3 h-3" />
                    {customer.type}
                  </div>
                </TableCell>

                {/* Status */}
                <TableCell>
                  <div className="inline-flex items-center rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs font-medium">
                    {customer.status}
                  </div>
                </TableCell>

                {/* Actions */}
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" size="sm" className="rounded-lg">
                      View
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
