import { prisma } from "@/lib/prisma";

export const getCustomer = (customerId: string) =>
  prisma.customer.findUnique({
    where: { id: customerId },
    include: {
      chatThreads: true,
      calls: true,
      designProjects: {
        include:{
          mockups: true
        }
      },
      subBookingData: {
        include: {
          mockups: true,
          paintColors: true,
        }
      },
      subdomain: {
        select: {
          id: true,
        }
      },
    },
  });

export type CustomerData = Awaited<ReturnType<typeof getCustomer>>;
