import { RoomClient } from "@/components/rooms/room-client-page";
import { RoomDetailsView } from "@/components/rooms/room-details-view";
import { getRoomKey } from "@/lib/redis/services/room";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

interface Params {
  params: Promise<{
    roomId: string;
    slug: string;
  }>;
}

export default async function page({ params }: Params) {
  const { roomId, slug } = await params;

  const dbRoom = await prisma.room.findFirst({
    where: {
      roomKey: roomId,
      status: "COMPLETED",
      domain: { slug: slug },
    },
    include: { booking: true },
  });

  if (dbRoom) {
   
    return <RoomDetailsView room={dbRoom as any} />;
  }

  const roomData = await getRoomKey(roomId);

  if (roomData) {
    return (
      <div>
        <RoomClient
          roomId={roomId}
          roomData={roomData}
          slug={slug}
          mode="project"
        />
      </div>
    );
  }

  return notFound();
}
