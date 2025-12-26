import { prisma } from "@/lib/prisma";
import { getRoomKey } from "@/lib/redis/services/room";
import { notFound } from "next/navigation";
import { RoomClient } from "@/components/rooms/room-client-page";

interface Params {
  params: Promise<{ roomId: string; slug: string; }>;
  searchParams: Promise<{ role?: string }>; // Just define what you actually need
}

export default async function Page({ params, searchParams }: Params) {
  const { roomId, slug } = await params;
  const search = await searchParams;
  
  // Check if role=client exists
  const role = search.role

  const subdomain = await prisma.subdomain.findUnique({
    where: { slug }
  });

  if (!subdomain) return notFound();
  
  const roomData = await getRoomKey(roomId);
  if (!roomData) return notFound();
  
  return <RoomClient roomId={roomId} roomData={roomData} slug={slug} role={role} />;
}