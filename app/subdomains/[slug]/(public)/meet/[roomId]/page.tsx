import { prisma } from "@/lib/prisma";
import { getRoomKey } from "@/lib/redis/services/room";
import { notFound } from "next/navigation";
import { RoomClient } from "@/components/rooms/room-client-page";

interface Params {
  params: Promise<{ roomId: string; slug: string; }>;
}

export default async function Page({ params }: Params) {
  const { roomId, slug } = await params;

  const subdomain = await prisma.subdomain.findUnique({
    where: { slug }
  });

  if (!subdomain) return notFound();
  
  const roomData = await getRoomKey(roomId); // Redis data
  if (!roomData) return notFound();
  
  // Pass all that server data into the Client Wrapper
  return <RoomClient roomId={roomId} roomData={roomData} slug={slug} />;
}