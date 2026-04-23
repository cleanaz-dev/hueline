import { prisma } from "../../config";

export async function getAllClients() {
  const subdomains = await prisma.subdomain.findMany({
    where: {
      slug: {
        not: "admin"
      },
      client: {
        isNot: null
      }
    },
    select: {
      id: true,
      slug: true,
      projectUrl: true,
      active: true,
      bookings: {
        select: {
          calls: {
            select: {
              intelligence: {
                select: {
                  estimatedAdditionalValue: true
                }
              }
            }
          }
        }
      },
      client: {
        select: {
          firstName: true,
          lastName: true,
          email: true,
          company: true,
          phone: true,
          hours: true,
          crm: true,
          status: true,
          // Stripe
          stripeCustomerId: true,
          stripeSubscriptionId: true,
          setupFeePaid: true,
          planName: true,
          planPrice: true,
          planStatus: true,
          currentPeriodEnd: true,
        }
      }
    }
  });

  return subdomains.map(subdomain => {
    const { client } = subdomain;

    const totalCalls = subdomain.bookings.reduce((sum, booking) => {
      return sum + booking.calls.length;
    }, 0);

    const totalValueFound = subdomain.bookings.reduce((sum, booking) => {
      return sum + booking.calls.reduce((callSum, call) => {
        return callSum + (call.intelligence?.estimatedAdditionalValue ?? 0);
      }, 0);
    }, 0);

    return {
      id: subdomain.id,
      slug: subdomain.slug,
      active: subdomain.active,
      projectUrl: subdomain.projectUrl,
      // All account identity now comes from Client
      companyName: client?.company ?? null,
      planName: client?.planName ?? null,
      planPrice: client?.planPrice ?? null,
      planStatus: client?.planStatus ?? null,
      currentPeriodEnd: client?.currentPeriodEnd ?? null,
      setupFeePaid: client?.setupFeePaid ?? false,
      totalCalls,
      totalValueFound,
      client: {
        name: [client?.firstName, client?.lastName].filter(Boolean).join(" "),
        email: client?.email ?? null,
        phone: client?.phone ?? null,
        company: client?.company ?? null,
        hours: client?.hours ?? null,
        crm: client?.crm ?? null,
        status: client?.status ?? null,
        stripeCustomerId: client?.stripeCustomerId ?? null,
        stripeSubscriptionId: client?.stripeSubscriptionId ?? null,
      }
    };
  });
}