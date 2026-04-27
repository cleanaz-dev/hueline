"use client";

import { useEffect } from "react";
import { getCalApi } from "@calcom/embed-react";
import {
  Calendar,
  Video,
  Sparkles,
  Globe,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

interface BookingCTAProps {
  name?: string;
}

export const BookingCTA = ({ name }: BookingCTAProps) => {
  const router = useRouter();

  // Initialize Cal.com API
  useEffect(() => {
    (async function () {
      const cal = await getCalApi();
      cal("ui", {
        theme: "light",
        styles: { branding: { brandColor: "#2563eb" } },
        hideEventTypeDetails: false,
        layout: "month_view",
      });
    })();
  }, []);

  const features = [
    {
      icon: Sparkles,
      title: "AI-Generated Mockups",
      description: "Images created in real-time",
    },
    {
      icon: Video,
      title: "AI Video Survey",
      description: "Automated property walkthroughs",
    },
    {
      icon: Globe,
      title: "Custom Subdomain",
      description: "Your branded client portal",
    },
  ];

  const handleBookClick = () => {
    const params = new URLSearchParams();
    if (name) {
      params.append("name", name);
    }
    router.push(`/booking${params.toString() ? `?${params.toString()}` : ""}`);
  };

  return (
    <div className="pb-14 md:pb-20">
      <div className="w-full border-2 border-blue-600 rounded-3xl p-6 md:p-8 bg-linear-to-br from-blue-50/50 to-white relative overflow-hidden">
        {/* Subtle Background Pattern */}
        <div className="absolute inset-0 bg-grid-slate-100 mask-[linear-gradient(0deg,white,rgba(255,255,255,0.6))] -z-10" />

        <div className="relative z-10">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 bg-blue-600 text-white px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-4 shadow-lg shadow-blue-200">
              <Calendar className="w-3.5 h-3.5" />
              Schedule Demo
            </div>

            <h2 className="text-3xl md:text-4xl text-gray-900 mb-3 tracking-tight">
              See <span className="text-accent font-semibold">Hue-Line</span> in
              Action
            </h2>
            <p className="text-sm md:text-base text-gray-600 max-w-xl mx-auto font-medium">
              Book a live demo to see how our AI agent transforms property
              consultations into instant visual proposals.
            </p>
          </div>

          {/* Feature Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {features.map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <div
                  key={idx}
                  className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-all hover:-translate-y-0.5 group text-center md:text-left"
                >
                  <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center mb-3 group-hover:bg-blue-100 transition-colors mx-auto md:mx-0">
                    <Icon className="w-5 h-5 text-blue-600" />
                  </div>
                  <h4 className="font-bold text-gray-900 text-sm mb-1">
                    {feature.title}
                  </h4>
                  <p className="text-xs text-gray-500 font-medium">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>

          {/* CTA Button */}
          <Button
            onClick={handleBookClick}
            className="w-full h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-base shadow-lg shadow-blue-200 transition-all hover:shadow-xl group"
          >
            Book Your Live Demo
            <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>

          <p className="text-[10px] text-center text-gray-400 mt-3 font-medium">
            30-minute demo • No commitment required
          </p>
        </div>
      </div>
    </div>
  );
};