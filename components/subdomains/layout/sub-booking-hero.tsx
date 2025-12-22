import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  Clock,
  User2,
  Calendar,
  Share2,
  Sparkles,
  Timer,
  IdCard,
  Info,
  Phone,
} from "lucide-react";
import Image from "next/image";
import PaletteImage from "@/public/images/bucket-no-bg.png";
import SubShareProjectDialog from "./sub-share-project-dialog";
import { BookingData } from "@/types/subdomain-type";
import { Badge } from "@/components/ui/badge"; // Assuming you have shadcn badge, or use a standard span
import { Separator } from "@/components/ui/separator"; // Assuming shadcn separator

interface BookingHeroProps {
  booking: BookingData;
  formatTime: (duration?: string | null) => string;
  slug: string;
}

export function SubBookingHero({
  booking,
  formatTime,
  slug,
}: BookingHeroProps) {
  const hasSharedAccess = !!booking.sharedAccess?.length;

  // Calculate expiry hours effectively
  const hoursLeft = 72; // You can make this dynamic based on booking.expires_at

  return (
    <section className="w-full max-w-5xl mx-auto mb-8">
      {/* 1. Header with integrated Title & Badge */}
      <div className="flex flex-col items-center justify-center text-center space-y-4 mb-8">
        {/* <Badge variant="outline" className="px-4 py-1 border-primary/20 bg-primary/5 text-primary tracking-wide uppercase text-[10px] font-bold shadow-sm">
          AI Color Consultation
        </Badge> */}

        <div className="relative">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-gray-900">
            Painting <span className="text-primary">Report</span>
          </h1>
        </div>

        <p className="text-gray-500 text-lg max-w-lg mx-auto font-light">
          A personalized color curation prepared exclusively for the
          <span className="font-medium text-gray-800">
            {" "}
            {booking.roomType || "Home"}
          </span>{" "}
          renovation.
        </p>
      </div>

      {/* 2. The Premium Card */}
      <div className="bg-white rounded-2xl  border border-gray-100 overflow-hidden relative">
        <div className="flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-gray-100">
          {/* Section A: Key Metrics (Grid Layout) */}
          <div className="flex-1 p-6 md:p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">
                Project Details
              </h3>
              <SubShareProjectDialog
                huelineId={booking.huelineId}
                hasSharedAccess={hasSharedAccess}
                slug={slug}
              />
            </div>

            <div className="grid grid-cols-2 gap-y-6 gap-x-4">
              <DetailItem icon={User2} label="Client" value={booking.name} />
              <DetailItem icon={Phone} label="Phone" value={booking.phone} />
              <DetailItem
                icon={Calendar}
                label="Date"
                // 🔥 FIX: Wrap in new Date() to handle both string and Date types
                value={new Date(booking.dateTime).toLocaleDateString(
                  undefined,
                  {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  }
                )}
              />
              <DetailItem icon={Info} label="ID" value={booking.huelineId} />
            </div>
          </div>

          {/* Section B: The "Authorized By" Sidebar */}
          <div className="md:w-72 bg-gray-50/50 p-6 md:p-8 flex flex-col justify-center">
            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">
                Prepared By
              </p>
              <div className="flex items-center gap-3">
                <Avatar className="size-12 border-2 border-white shadow-md">
                  <AvatarImage src="/images/agent-avatar.png" />
                  <AvatarFallback className="bg-primary text-white">
                    AN
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-bold text-gray-900 text-sm">Annalia</p>
                  <p className="text-xs text-primary font-medium">
                    Design Consultant
                  </p>
                </div>
              </div>

              <Separator className="my-3" />

              <div className="flex items-center gap-2">
                <div className="size-6 rounded-full bg-blue-50 flex items-center justify-center">
                  <Image
                    src={PaletteImage}
                    alt="logo"
                    className="w-3 h-3 object-contain"
                  />
                </div>
                <span className="text-[10px] text-gray-500 font-medium">
                  Hue-Line Certified
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// Helper component to clean up the grid
function DetailItem({
  icon: Icon,
  label,
  value,
}: {
  icon: any;
  label: string;
  value: string;
}) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-2 text-xs font-medium text-gray-400 uppercase">
        <Icon className="w-3.5 h-3.5" />
        <span>{label}</span>
      </div>
      <p className="font-semibold text-gray-900 text-sm md:text-base">
        {value}
      </p>
    </div>
  );
}
