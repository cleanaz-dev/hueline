// lib/prisma/queries/customer/get-customer.ts

import { prisma } from "@/lib/prisma";
import { getPresignedUrl } from "@/lib/aws/s3";

export const getCustomer = (customerId: string) =>
  prisma.customer.findUnique({
    where: { id: customerId },
    include: {
      chatThreads: true,
      calls: {
        include: {
          intelligence: true,
        },
      },
      designProjects: {
        include: {
          mockups: true,
        },
      },
      subBookingData: {
        include: {
          mockups: true,
          paintColors: true,
        },
      },
      subdomain: {
        select: {
          id: true,
        },
      },
    },
  });

export type CustomerData = Awaited<ReturnType<typeof getCustomer>>;

async function resolveDesignProjectUrls(
  projects: NonNullable<CustomerData>["designProjects"],
) {
  return Promise.all(
    (projects ?? []).map(async (project) => ({
      ...project,
      compressedImageS3Key: project.compressedImageS3Key
        ? await getPresignedUrl(project.compressedImageS3Key)
        : null,
      mockups: await Promise.all(
        (project.mockups ?? []).map(async (mockup) => ({
          ...mockup,
          compressedS3Key: mockup.compressedS3Key
            ? await getPresignedUrl(mockup.compressedS3Key)
            : null,
        })),
      ),
    })),
  );
}

async function resolveCallUrls(calls: NonNullable<CustomerData>["calls"]) {
  return Promise.all(
    (calls ?? []).map(async (call) => ({
      ...call,
      audioUrl: call.audioUrl ? await getPresignedUrl(call.audioUrl) : null,
    })),
  );
}

async function resolveSubBookingUrls(
  bookings: NonNullable<CustomerData>["subBookingData"],
) {
  return Promise.all(
    (bookings ?? []).map(async (booking) => ({
      ...booking,
      compressOriginalImages: booking.compressOriginalImages
        ? await getPresignedUrl(booking.compressOriginalImages)
        : null,
      mockups: await Promise.all(
        (booking.mockups ?? []).map(async (mockup) => ({
          ...mockup,
          compressedS3Key: mockup.compressedS3Key
            ? await getPresignedUrl(mockup.compressedS3Key)
            : null,
        })),
      ),
    })),
  );
}

export async function getCustomerWithUrls(customerId: string) {
  const customer = await getCustomer(customerId);
  if (!customer) return null;

  const [designProjects, calls, subBookingData] = await Promise.all([
    resolveDesignProjectUrls(customer.designProjects),
    resolveCallUrls(customer.calls),
    resolveSubBookingUrls(customer.subBookingData),
  ]);

  return Object.assign(customer, { designProjects, calls, subBookingData });
}

export type CustomerWithUrls = Awaited<ReturnType<typeof getCustomerWithUrls>>;