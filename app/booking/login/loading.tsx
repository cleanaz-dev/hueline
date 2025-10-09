import { Spinner } from "@/components/ui/spinner";

export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center ">
      <div className="flex flex-col items-center gap-4">
        <Spinner />
        <p className="text-gray-600 text-lg">Loading...</p>
      </div>
    </div>
  );
}