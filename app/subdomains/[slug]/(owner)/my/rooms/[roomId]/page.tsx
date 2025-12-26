import { RoomClient } from "@/components/rooms/room-client-page";
import { getRoomKey } from "@/lib/redis/services/room";
import { notFound } from "next/navigation";

interface Params {
  params: Promise<{
    roomId: string;
  }>
}

export default async function page({params}: Params) {

  const { roomId, slug } = await params

  const roomData = await getRoomKey(roomId)
  console.log("Room Data", roomData)

  if(!roomData || !slug) return notFound()

  return (
    <div>
      <RoomClient roomId={roomId} roomData={roomData} slug={slug} />
    </div>
  )
}