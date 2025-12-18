import { prisma } from "../../config";

export async function getAllClients() {
  const clients = await prisma.subdomain.findMany({
    where: {
      slug: {
        not: "admin"
      }
    },
    select: {
      id: true,
      slug: true,
      companyName: true,
      planName: true,
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
      }
    }
  });

  // Transform the data to be more usable
  return clients.map(client => {
    // Calculate total calls across all bookings
    const totalCalls = client.bookings.reduce((sum, booking) => {
      return sum + booking.calls.length;
    }, 0);

    // Calculate total value found across all call intelligence
    const totalValueFound = client.bookings.reduce((sum, booking) => {
      const bookingValue = booking.calls.reduce((callSum, call) => {
        return callSum + (call.intelligence?.estimatedAdditionalValue || 0);
      }, 0);
      return sum + bookingValue;
    }, 0);

    return {
      id: client.id,
      slug: client.slug,
      companyName: client.companyName,
      planName: client.planName,
      active: client.active,
      totalCalls,
      totalValueFound,
      projectUrl: client.projectUrl
    };
  });
}