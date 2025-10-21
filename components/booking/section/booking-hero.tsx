import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Clock, User2, Palette, Calendar } from "lucide-react";
import Image from "next/image";
import PaletteImage from "@/public/images/bucket-no-bg.png"

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
      <div className="flex items-center justify-center gap-1">
        <Image 
        src={PaletteImage}
        alt="palette-image"
        className="size-10 md:size-14"
        />
        <h1 className="text-3xl md:text-5xl font-bold leading-20 text-primary ">
          Painting Report
        </h1>
      </div>
      
      <div className="flex flex-col md:flex-row gap-0 rounded-xl overflow-hidden bg-white shadow-sm">
        {/* Report Info Section - Subtle and professional */}
        <div className="flex-1 p-6 bg-gray-50/50">
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <User2 className="h-4 w-4 text-gray-500" />
              <span className="font-medium">Prepared for:</span>
              <span>{booking.name}</span>
            </div>

            <div className="flex items-center gap-3 text-sm text-gray-600">
              <Clock className="h-4 w-4 text-gray-500" />
              <span className="font-medium">Call Duration:</span>
              <span>{formatTime(booking.call_duration)}</span>
            </div>

            <div className="flex items-center gap-3 text-sm text-gray-600">
              <Calendar className="h-4 w-4 text-gray-500" />
              <span className="font-medium">Date:</span>
              <span>{new Date().toLocaleDateString()}</span>
            </div>

            <div className="flex items-center gap-3 text-sm text-amber-600 font-medium">
              <Clock className="h-4 w-4" />
              <span>Expires in: 72h</span>
            </div>
          </div>
        </div>

        {/* Agent Section - Full height white background */}
        <div className="md:w-64 p-6 bg-white  flex items-center">
          <div className="flex items-center gap-3 w-full">
            <Avatar className="size-10">
              <AvatarImage src="/images/agent-avatar.png" />
              <AvatarFallback>AN</AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">By: Annalia</p>
              <p className="text-xs text-gray-500 truncate">Hue-Line Design Consultant</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}