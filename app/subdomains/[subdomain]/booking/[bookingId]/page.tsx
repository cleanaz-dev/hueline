// app/subdomains/[subdomain]/booking/[bookingId]/page.tsx

interface Props {
  params: Promise<{ 
    subdomain: string;
    bookingId: string;
  }>;
}

export default async function BookingPage({ params }: Props) {
  const { subdomain, bookingId } = await params;
  
  // TODO: Fetch booking from Redis
  // const booking = await getBooking(subdomain, bookingId);
  
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Booking Details</h1>
      <p>Subdomain: {subdomain}</p>
      <p>Booking ID: {bookingId}</p>
    </div>
  );
}