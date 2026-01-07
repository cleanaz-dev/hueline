// app/booking/[huelineId]/[roomId]/loading.tsx
import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-zinc-950 text-white gap-4">
      <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
      <p className="animate-pulse text-sm font-medium text-zinc-400">
        Securing connection...
      </p>
    </div>
  );
}