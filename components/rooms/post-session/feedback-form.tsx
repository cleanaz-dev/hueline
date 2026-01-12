"use client";

import React, { useState } from "react";
import { ArrowRight, Calendar, Clock, Phone, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

interface FeedbackFormProps {
  companyName: string;
}

export function FeedbackForm({ companyName }: FeedbackFormProps) {
  const [selectedSlot, setSelectedSlot] = useState<string>("callback");

  // Faux schedule data
  const scheduleOptions = [
    {
      id: "slot1",
      label: "Tomorrow Morning",
      time: "9:00 AM - 11:00 AM",
      icon: Calendar,
    },
    {
      id: "slot2",
      label: "Tomorrow Afternoon",
      time: "1:00 PM - 3:00 PM",
      icon: Clock,
    },
    {
      id: "callback",
      label: "Coordinate Later",
      time: "I'll wait for a call back",
      icon: Phone,
    },
  ];

  return (
    <div className="bg-white rounded-lg border border-zinc-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-zinc-100 bg-zinc-50/50">
        <h4 className="text-sm font-bold text-zinc-900 uppercase tracking-wider">
          Final Review & Next Steps
        </h4>
      </div>

      <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* COL 1: Scope Notes */}
        <div className="space-y-4">
          <div>
            <label className="text-sm font-semibold text-zinc-900 block mb-1">
              Scope Adjustments
            </label>
            <p className="text-xs text-zinc-500 mb-3">
              Did the AI miss anything? Add details here.
            </p>
            <Textarea
              placeholder="e.g. Please include the baseboards in the hallway..."
              className="bg-white border-zinc-300 focus:border-zinc-900 focus:ring-zinc-900 min-h-[160px] resize-none text-sm rounded-md"
            />
          </div>
        </div>

        {/* COL 2: Scheduling */}
        <div className="space-y-4">
          <div>
            {/* UPDATED COPY HERE */}
            <label className="text-sm font-semibold text-zinc-900 block mb-1">
              Scheduling Preference
            </label>
            <p className="text-xs text-zinc-500 mb-3">
              Secure a priority slot now, or request a callback.
            </p>
            
            <div className="grid grid-cols-1 gap-2">
              {scheduleOptions.map((option) => {
                const isSelected = selectedSlot === option.id;
                const Icon = option.icon;
                
                return (
                  <div
                    key={option.id}
                    onClick={() => setSelectedSlot(option.id)}
                    className={cn(
                      "cursor-pointer flex items-center justify-between p-3 border rounded-md transition-all duration-200",
                      isSelected
                        ? "border-zinc-900 bg-zinc-50 ring-1 ring-zinc-900 shadow-sm"
                        : "border-zinc-200 hover:border-zinc-400 bg-white"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "p-2 rounded-md transition-colors",
                        isSelected ? "bg-zinc-900 text-white" : "bg-zinc-100 text-zinc-500"
                      )}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <p className={cn(
                          "text-sm font-medium transition-colors", 
                          isSelected ? "text-zinc-900" : "text-zinc-700"
                        )}>
                          {option.label}
                        </p>
                        <p className="text-xs text-zinc-500">
                          {option.time}
                        </p>
                      </div>
                    </div>
                    
                    {/* Visual checkmark only appears when selected */}
                    {isSelected && (
                      <div className="animate-in fade-in zoom-in duration-200">
                         <Check className="w-4 h-4 text-zinc-900 mr-1" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Footer / Action */}
      <div className="p-4 bg-zinc-50 border-t border-zinc-100 flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="text-xs text-zinc-500 text-center md:text-left">
          Updates will be sent to <span className="font-bold text-zinc-900">{companyName}</span> for final approval.
        </p>
        <Button className="w-full md:w-auto bg-zinc-900 hover:bg-zinc-800 text-white rounded-md h-10 px-6 transition-transform active:scale-95">
          Confirm & Schedule
          <ArrowRight className="ml-2 w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}