// app/.../[customerId]/page.tsx

import CustomerSinglePage from "@/components/owner/customers/single-customer-page";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getCustomerWithUrls } from "@/lib/prisma/queries/customer/get-customer";
import { getServerSession } from "next-auth";
import { notFound, unauthorized , forbidden, redirect } from "next/navigation";

interface Params {
  params: Promise<{
    customerId: string;
  }>;
}

export default async function Page({ params }: Params) {
  const { customerId } = await params;

  const session = await getServerSession(authOptions);
  const user = session?.user;

  if (!user || !user.email) return redirect("https://www.hue-line.com/sign-in");

  const [customer, operator] = await Promise.all([
    getCustomerWithUrls(customerId),
    prisma.subdomainUser.findFirst({
      where: { email: user.email },
      select: { subdomainId: true },
    }),
  ]);

  console.log("Fetched customer:", customer);

  if (!customer) return notFound();
  if (!operator) return unauthorized();
  if (operator.subdomainId !== customer.subdomain?.id) return forbidden();

  return <CustomerSinglePage customer={customer} />;
}