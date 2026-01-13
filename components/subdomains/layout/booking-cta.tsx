"use client";

import { useState } from "react";
import {
  Calendar,
  Video,
  Sparkles,
  Globe,
  X,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export const BookingCTA = () => {
  const [showCalendly, setShowCalendly] = useState(false);

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

  return (
    <>
      <div className="w-full border-2 border-blue-600 rounded-3xl p-6 md:p-8 bg-gradient-to-br from-blue-50/50 to-white relative overflow-hidden">
        {/* Subtle Background Pattern */}
        <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] -z-10" />

        <div className="relative z-10">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 bg-blue-600 text-white px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-4 shadow-lg shadow-blue-200">
              <Calendar className="w-3.5 h-3.5" />
              Schedule Demo
            </div>

            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3 tracking-tight">
              See HueLine AI in Action
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
            onClick={() => setShowCalendly(true)}
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

      {/* Calendly Modal */}
      {showCalendly && (
        <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl h-[90vh] overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 md:p-6 border-b border-gray-100 flex-shrink-0">
              <div>
                <h3 className="text-xl font-bold text-slate-900">
                  Schedule Your Demo
                </h3>
                <p className="text-sm text-slate-500 mt-0.5">
                  Choose a time that works for you
                </p>
              </div>
              <button
                onClick={() => setShowCalendly(false)}
                className="bg-slate-100 hover:bg-slate-200 p-2 rounded-full transition-colors"
              >
                <X size={20} className="text-slate-600" />
              </button>
            </div>

            {/* Calendly Embed */}
            <div className="flex-1 overflow-hidden">
              <iframe
                src="https://calendly.com/care-hue-line/30min"
                width="100%"
                height="100%"
                frameBorder="0"
                title="Schedule a demo"
                className="w-full h-full"
              />
            </div>

            {/* Footer Info */}
            <div className="flex-shrink-0 bg-slate-50 border-t border-slate-100 p-4">
              <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-slate-600">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 size={14} className="text-green-600" />
                  <span className="font-medium">30-minute session</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 size={14} className="text-green-600" />
                  <span className="font-medium">Live walkthrough</span>
                </div>
              
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};