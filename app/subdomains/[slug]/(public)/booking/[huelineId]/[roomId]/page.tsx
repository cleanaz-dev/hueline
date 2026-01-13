// app/booking/[huelineId]/[roomId]/page.tsx
import { prisma } from "@/lib/prisma";
import { getRoomKey } from "@/lib/redis/services/room";
import { notFound, redirect } from "next/navigation";
import { RoomClient } from "@/components/rooms/room-client-page";

interface Params {
  params: Promise<{ roomId: string; huelineId: string; }>;
}

export default async function BookingRoomPage({ params }: Params) {
  const { roomId, huelineId } = await params;
  
  // Verify booking exists and belongs to user
  const booking = await prisma.subBookingData.findUnique({
    where: { huelineId },
    include: { subdomain: true }
  });

  if (!booking) return notFound();
  
  // Verify room belongs to this booking
  const roomData = await getRoomKey(roomId);
  if (!roomData || roomData.bookingId !== booking.id) {
    return redirect(`/booking/${huelineId}`);
  }
  
  // ✅ Check if room is completed in the database
  const room = await prisma.room.findUnique({
    where: { roomKey: roomId },
    select: { status: true }
  });

  // If room is completed or expired, redirect to booking page
  if (room && (room.status === "COMPLETED" || room.status === "EXPIRED")) {
    return redirect(`/booking/${huelineId}`);
  }
  
  return (
    <RoomClient 
      roomId={roomId} 
      roomData={roomData} 
      slug={booking.subdomain.slug} 
      role="client"
      mode="self-serve"
      huelineId={huelineId}
    />
  );
}