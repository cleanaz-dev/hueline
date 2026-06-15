"use client";

import { PersonStanding, Users } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import OwnerPageHeader from "@/components/owner/owner-page.header";
import { useOwner } from "@/context/owner-context";

// Make sure to adjust this import path to where you saved the table
import { MainCustomerTable } from "@/components/owner/customers/mian-customer-table";

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
    <main className="container max-w-7xl mx-auto px-4 pb-12 space-y-6">
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

      <MainCustomerTable data={customers} />
    </main>
  );
}