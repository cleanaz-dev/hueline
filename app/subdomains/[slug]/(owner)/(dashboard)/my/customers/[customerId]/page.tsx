import CustomerSinglePage from "@/components/owner/customers/single-customer-page";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getCustomer } from "@/lib/prisma/queries/customer/get-customer";
import { getServerSession } from "next-auth";
import { notFound } from "next/navigation";

interface Params {
  params: Promise<{
    customerId: string;
  }>;
}

export default async function Page({ params }: Params) {
  const { customerId } = await params;

  const customer = await getCustomer(customerId);
  console.dir(customer, { depth: null });
  

  const session = await getServerSession(authOptions);
  const user = session?.user;

  const isOperatorValid = await prisma.subdomainUser.findFirst({
    where: {
      email: user?.email ?? undefined,
      subdomainId: customer?.subdomain?.id ?? undefined,
    },
  });

  if (!isOperatorValid) return notFound();



  return <CustomerSinglePage customer={customer} />;
}
