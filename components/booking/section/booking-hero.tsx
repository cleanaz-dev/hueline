import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Clock, User2, Palette, Calendar } from "lucide-react";


interface BookingHeroProps {
  booking: {
    name: string;
    call_duration?: string;
  };
  formatTime: (duration?: string) => string;
}

export function BookingHero({ booking, formatTime }: BookingHeroProps) {
  return (
    <section className="space-y-6">
      <div className="flex items-center justify-center gap-2">
        <Palette className="h-8 w-8 text-primary" />
        <h1 className="text-4xl md:text-5xl font-bold leading-20 text-primary">
          Painting Report
        </h1>
      </div>
      <div className="p-6 bg-gradient-to-br from-primary/10 via-primary/5 to-secondary/10 rounded-xl flex flex-col md:flex-row justify-between gap-4">
        <div className="space-y-2">
          <p className="text-lg md:text-xl flex items-center gap-2">
            <User2 className="h-5 w-5 text-primary" />
            <span className="font-medium">Prepared for:</span> {booking.name}
          </p>
          <div className="text-lg md:text-xl flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            <span className="font-medium">Call Duration:</span>{" "}
            {formatTime(booking.call_duration)}
          </div>
          <div className="text-lg md:text-xl flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            <span className="font-medium">Date:</span>{" "}
            {new Date().toLocaleDateString()}
          </div>
        </div>

        <div className="inline-flex items-center justify-center gap-3 md:justify-end mt-4 md:mt-0">
          <Avatar className="size-12">
            <AvatarImage src="/images/agent-avatar.png" />
            <AvatarFallback>AN</AvatarFallback>
          </Avatar>
          <div className="text-left">
            <p className="text-base md:text-lg font-medium">By: Annalia</p>
            <p className="text-base md:text-lg text-muted-foreground">
              HueLine Design Consultant
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}