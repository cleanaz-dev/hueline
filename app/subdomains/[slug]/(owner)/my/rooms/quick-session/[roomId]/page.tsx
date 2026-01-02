import { RoomClient } from "@/components/rooms/room-client-page";
import { RoomDetailsView } from "@/components/rooms/room-details-view";
import { prisma } from "@/lib/prisma";
import { getRoomKey } from "@/lib/redis";
import { notFound } from "next/navigation";

interface Params {
  params: Promise<{
    roomId: string;
    slug: string;
  }>;
}

export default async function page({ params }: Params) {
  const { roomId, slug } = await params;

  const roomData = await getRoomKey(roomId);

  if (roomData) {
    return (
      <div>
        <RoomClient
          roomId={roomId}
          roomData={roomData}
          slug={slug}
          mode="quick"
        />
      </div>
    );
  }

  // 2. Try Cold Storage (DB)
  const dbRoom = await prisma.room.findFirst({
    where: {
      roomKey: roomId,
      domain: { slug: slug },
    },
    include: { booking: true },
  });

  if (dbRoom) {
    // 👇 FIX: Cast to 'any' or 'unknown as Room' to bypass the strict relation check
    // We only need the scalar fields (name, phone) for the view anyway.
    return <RoomDetailsView room={dbRoom as any} />;
  }

  // 3. 404
  return notFound();
}
