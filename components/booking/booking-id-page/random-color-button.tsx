"use client";

import { Button } from "@/components/ui/button";
import { Dices } from "lucide-react";

export function RandomColorButton({ bookingId }: { bookingId: string }) {
  const handleRandomColor = async () => {
    await fetch(`/api/booking/${bookingId}/random-colors`, { method: "POST" });
  };

  return (
    <Button onClick={handleRandomColor} variant="outline">
      <Dices className="sm:size-6" />
    </Button>
  );
}