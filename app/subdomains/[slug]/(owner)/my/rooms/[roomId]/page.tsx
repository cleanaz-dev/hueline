import { RoomClient } from "@/components/rooms/room-client-page";

interface Params {
  params: Promise<{
    roomId: string;
  }>
}

export default async function page({params}: Params) {

  const { roomId } = await params
  return (
    <div>
      <RoomClient roomId={roomId}/>
    </div>
  )
}