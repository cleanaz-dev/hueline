import { notFound } from "next/navigation";
import { getClientPostSession } from "@/lib/prisma/queries/post-session/get-client-post-session";
import ClientPostSessionWrapper from "@/components/rooms/post-session/client-post-session-wrapper";

interface Params {
  params: Promise<{
    huelineId: string;
    roomId: string;
  }>;
}

export default async function Page({ params }: Params) {
  const { huelineId, roomId } = await params;
  if(!huelineId || !roomId) return notFound();

  // 1. Get whatever data exists right now
  const initialData = await getClientPostSession(huelineId, roomId);

  // 2. Pass it to the wrapper. The wrapper figures out if it needs to wait.
  return (
    <ClientPostSessionWrapper 
      huelineId={huelineId} 
      roomId={roomId} 
      initialData={initialData} 
    />
  );
}