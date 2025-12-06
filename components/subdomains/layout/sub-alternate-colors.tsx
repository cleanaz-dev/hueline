"use client";

import { Palette, Sofa, Zap, Share2, Lock, CheckCircle2 } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  RiMoonFill,
  RiSparkling2Line,
  RiSunFill,
  RiDiceLine,
} from "react-icons/ri";
import { toast } from "sonner";
import GenerateDialog from "@/components/booking/generate-dialog";
import { BookingData } from "@/types/subdomain-type";
import { cn } from "@/lib/utils"; // Assuming you have a cn utility, or just use string concat

interface ComponentProps {
  booking: BookingData;
  hasGeneratedImage: boolean;
  hasSharedAccess: boolean;
}

export default function SubAlternateDesign({
  booking,
  hasGeneratedImage,
  hasSharedAccess,
}: ComponentProps) {
  const [removeFurniture, setRemoveFurniture] = useState(false);
  const [selectedOption, setSelectedOption] = useState("");
  const [showGenerateDialog, setShowGenerateDialog] = useState(false);
  const [generateStatus, setGenerateStatus] = useState<"idle" | "generating" | "success" | "error">("idle");

  const options = [
    { id: "brighter", icon: RiSunFill, label: "Brighter" },
    { id: "darker", icon: RiMoonFill, label: "Darker" },
    { id: "trendy", icon: RiSparkling2Line, label: "Trendy" },
    { id: "random", icon: RiDiceLine, label: "Surprise" },
  ];

 

  const handleSelectOption = (optionId: string) => {
    if (hasGeneratedImage || !hasSharedAccess) return;
    setSelectedOption(selectedOption === optionId ? "" : optionId);
  };

  const handleGenerateClick = async () => {
    if (!selectedOption || hasGeneratedImage || !hasSharedAccess) return;

    setShowGenerateDialog(true);
    setGenerateStatus("generating");

    try {
      const response = await fetch(
        `/api/booking/${booking.phone}/generate-mockup`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            option: selectedOption,
            removeFurniture: removeFurniture,
            currentColor: booking.paintColors,
            originalImageS3Key: booking.originalImages,
          }),
        }
      );

      if (!response.ok) throw new Error("Failed to generate mockup");
      
      setGenerateStatus("success");
    } catch (error) {
      console.error(error);
      toast.error("Failed to generate mockup");
      setGenerateStatus("error");
      setShowGenerateDialog(false);
    }
  };

  const handleViewDesign = () => {
    setShowGenerateDialog(false);
    window.location.reload();
  };

  // --- STATE VIEWS ---

  // 1. LOCKED VIEW (Needs Share)
  if (!hasSharedAccess) {
    return (
      <div className="relative h-full min-h-[250px] bg-gray-50 rounded-xl border border-gray-100 overflow-hidden flex flex-col items-center justify-center p-6 text-center">
        <div className="bg-white p-4 rounded-full shadow-sm mb-4">
          <Lock className="w-6 h-6 text-gray-400" />
        </div>
        <h3 className="font-semibold text-gray-900 mb-1">Unlock AI Variations</h3>
        <p className="text-sm text-gray-500 mb-6 max-w-[200px]">
          Share this project to generate alternate lighting & furniture options.
        </p>
        <Button variant="outline" className="gap-2 border-blue-200 text-blue-600 hover:bg-blue-50 hover:text-blue-700">
          <Share2 className="w-4 h-4" />
          Share to Unlock
        </Button>
      </div>
    );
  }

  // 2. COMPLETED VIEW (Already Generated)
  if (hasGeneratedImage) {
    return (
      <div className="h-full min-h-[250px] bg-green-50/50 rounded-xl border border-green-100 flex flex-col items-center justify-center p-6 text-center">
        <div className="bg-white p-3 rounded-full shadow-sm mb-3">
          <CheckCircle2 className="w-8 h-8 text-green-600" />
        </div>
        <h3 className="font-semibold text-gray-900">Design Generated</h3>
        <p className="text-sm text-gray-500 mt-1">
          You have used your free AI generation credit for this session.
        </p>
      </div>
    );
  }

  // 3. ACTIVE VIEW (The Control Panel)
  return (
    
<div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 h-full flex flex-col">
  {/* Header */}
  <div className="flex items-center justify-between mb-4">
    <div className="flex items-center gap-2">
      <Zap className="w-4 h-4 text-primary fill-primary" />
      <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500">
        Hue-Line Engine
      </h3>
    </div>
    <Badge variant="secondary" className="bg-gray-100 text-gray-600 text-[10px]">
      1 Credit Remaining
    </Badge>
  </div>

  {/* Description */}
  <p className="text-xs text-gray-500 mb-4 leading-relaxed">
    Generate alternative designs with different styles and color combinations. Toggle furniture removal for a cleaner preview.
  </p>

  {/* Furniture Switch */}
  <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg border border-gray-100 mb-4 w-auto md:w-72">
    <div className="flex items-center gap-3">
      <div className="bg-white p-1.5 rounded-md shadow-sm text-gray-500">
        <Sofa className="w-4 h-4" />
      </div>
      <div className="flex items-center gap-2">
        <Label htmlFor="remove-furniture" className="text-sm font-medium cursor-pointer">
          Remove Furniture
        </Label>
        <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-blue-200 text-blue-600 bg-blue-50">
          BETA
        </Badge>
      </div>
    </div>
    <Switch
      id="remove-furniture"
      checked={removeFurniture}
      onCheckedChange={setRemoveFurniture}
    />
  </div>

  {/* Preset Grid - 4 columns on desktop, 2 on mobile */}
  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-10 mb-6 flex-1">
    {options.map((option) => {
      const Icon = option.icon;
      const isSelected = selectedOption === option.id;
      return (
        <button
          key={option.id}
          onClick={() => handleSelectOption(option.id)}
          className={cn(
            "relative flex flex-col items-center justify-center gap-2 p-3 rounded-xl border transition-all duration-200",
            isSelected
              ? "border-primary bg-primary/5 text-primary shadow-sm"
              : "border-gray-100 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50"
          )}
        >
          <Icon className={cn("w-5 h-5", isSelected ? "text-primary" : "text-gray-400")} />
          <span className="text-xs font-medium">{option.label}</span>
          
          {option.id === "trendy" && (
            <span className="absolute top-1 right-1 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
            </span>
          )}
        </button>
      );
    })}
  </div>

  {/* Generate Action */}
  <Button
    onClick={handleGenerateClick}
    disabled={!selectedOption || generateStatus === "generating"}
    className="w-full h-11 text-sm font-semibold shadow-lg shadow-primary/20"
  >
    {generateStatus === "generating" ? (
      <>Generating...</>
    ) : (
      <>
        <Zap className="w-4 h-4 mr-2" />
        Generate Variation
      </>
    )}
  </Button>

  {/* Hidden Dialog (Logic Preserved) */}
  <GenerateDialog
    isOpen={showGenerateDialog}
    status={generateStatus}
    selectedOption={selectedOption}
    removeFurniture={removeFurniture}
    onClose={() => setShowGenerateDialog(false)}
    onConfirmComplete={handleViewDesign}
  />
</div>
  );
}