// hooks/use-room-scopes.ts
import useSWR from 'swr';
import { ScopeItem } from '@/types/room-types';

interface RoomScopesResponse {
  id: string;
  scopeData: ScopeItem[];
  status: string;
  clientName: string;
  recordingUrl: string | null;
  presignedUrls: Record<string, string>;
}

const fetcher = async (url: string): Promise<RoomScopesResponse> => {
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch room scopes');
  return res.json();
};

export function useRoomScopes(slug: string, roomId: string) {
  const { data, error, isLoading, mutate } = useSWR<RoomScopesResponse>(
    slug && roomId ? `/api/subdomain/${slug}/room/${roomId}/scopes` : null,
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000, // 1 minute - since presigned URLs are valid for 1 hour
    }
  );

  return {
    room: data,
    scopeData: data?.scopeData || [],
    presignedUrls: data?.presignedUrls || {},
    isLoading,
    isError: error,
    mutate,
  };
}