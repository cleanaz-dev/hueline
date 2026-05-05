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
} from "react-icons/ri";
import { toast } from "sonner";
import GenerateDialog from "@/components/booking/generate-dialog";
import { BookingData } from "@/types/subdomain-type";
import { cn } from "@/lib/utils";
import { useBooking } from "@/context/booking-context";

// NEW: Broad color shades instead of exact paint hexes
const COLOR_SHADES = [
  { id: "red", label: "Red Shades", twClass: "bg-red-500" },
  { id: "orange", label: "Orange Shades", twClass: "bg-orange-500" },
  { id: "green", label: "Green Shades", twClass: "bg-green-600" },
  { id: "light_blue", label: "Light Blue", twClass: "bg-sky-400" },
  { id: "dark_blue", label: "Dark Blue", twClass: "bg-blue-800" },
  { id: "brown", label: "Brown & Beige", twClass: "bg-amber-700" },
  { id: "grey", label: "Grey & Charcoal", twClass: "bg-slate-500" },
];

interface ComponentProps {
  booking: BookingData;
  hasGeneratedImage: boolean;
}

export default function SubAlternateDesign({
  booking,
  hasGeneratedImage,
}: ComponentProps) {
  const [removeFurniture, setRemoveFurniture] = useState(false);
  const [selectedOption, setSelectedOption] = useState("");
  const [selectedShade, setSelectedShade] = useState(COLOR_SHADES[3]); // Default to Light Blue
  
  const [showGenerateDialog, setShowGenerateDialog] = useState(false);
  const [generateStatus, setGenerateStatus] = useState<"idle" | "generating" | "success" | "error">("idle");
  const { setIsShareDialogOpen, subdomain } = useBooking();
  const hasSharedAccess = true;

  // MODIFIED: 4th box is now "Color Shade"
  const options = [
    { id: "brighter", icon: RiSunFill, label: "Brighter" },
    { id: "darker", icon: RiMoonFill, label: "Darker" },
    { id: "trendy", icon: RiSparkling2Line, label: "Trendy" },
    { id: "shade", icon: Palette, label: "Color Shade" },
  ];

  const handleSelectOption = (optionId: string) => {
    if (hasGeneratedImage || !hasSharedAccess) return;
    setSelectedOption(selectedOption === optionId ? "" : optionId);
  };

  const handleGenerateClick = async () => {
    if (!selectedOption || hasGeneratedImage || !hasSharedAccess) return;

    setShowGenerateDialog(true);
    setGenerateStatus("generating");

    // If they picked a shade, we send the general prompt concept (e.g., "light_blue") instead of a hex
    const generationPayload = {
      option: selectedOption,
      removeFurniture: removeFurniture,
      currentColor: booking.paintColors,
      originalImageS3Key: booking.originalImages,
      targetShade: selectedOption === "shade" ? selectedShade.id : undefined,
      shadeLabel: selectedOption === "shade" ? selectedShade.label : undefined,
    };

    try {
      const response = await fetch(
        `/api/subdomain/${subdomain.slug}/booking/${booking.huelineId}/generate-mockup`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(generationPayload),
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

  // --- LOCKED & COMPLETED VIEWS REMAIN UNCHANGED ---
  if (!hasSharedAccess) {
    return (
      <div className="relative h-full min-h-62.5 bg-gray-50 rounded-xl border border-gray-100 overflow-hidden flex flex-col items-center justify-center p-6 text-center">
        <div className="bg-white p-4 rounded-full shadow-sm mb-4">
          <Lock className="w-6 h-6 text-gray-400" />
        </div>
        <h3 className="font-semibold text-gray-900 mb-1">Unlock AI Variations</h3>
        <p className="text-sm text-gray-500 mb-6 max-w-50">
          Share this project to generate alternate color options.
        </p>
        <Button 
          variant="outline"
          onClick={() => setIsShareDialogOpen(true)} 
          className="gap-2 border-blue-200 text-blue-600 hover:bg-blue-50 hover:text-blue-700"
        >
          <Share2 className="w-4 h-4" />
          Share to Unlock
        </Button>
      </div>
    );
  }

  if (hasGeneratedImage) {
    return (
      <div className="h-full min-h-50 bg-card rounded-xl border border-green-100 flex flex-col items-center justify-center p-6 text-center">
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

  // --- ACTIVE VIEW ---
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

      {/* Preset Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-10 mb-4 flex-none">
        {options.map((option) => {
          const Icon = option.icon;
          const isSelected = selectedOption === option.id;
          return (
            <button
              key={option.id}
              onClick={() => handleSelectOption(option.id)}
              className={cn(
                "relative flex flex-col items-center justify-center gap-2 p-3 rounded-xl border transition-all duration-200 cursor-pointer h-[72px]",
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

      {/* NEW: General Color Shade Selector */}
      {selectedOption === "shade" && (
        <div className="mb-4 p-3 bg-gray-50 border border-gray-200 rounded-lg animate-in slide-in-from-top-2 fade-in duration-200 flex-1">
          <Label className="text-[10px] text-gray-500 mb-3 block uppercase tracking-wider font-bold">
            Select a Vibe
          </Label>
          <div className="flex flex-wrap gap-2.5">
            {COLOR_SHADES.map((shade) => (
              <button
                key={shade.id}
                onClick={() => setSelectedShade(shade)}
                className={cn(
                  "w-8 h-8 rounded-full border-2 shadow-sm transition-all cursor-pointer",
                  shade.twClass,
                  selectedShade.id === shade.id 
                    ? "border-primary scale-110 ring-2 ring-primary/20" 
                    : "border-white hover:scale-105"
                )}
                title={shade.label}
              />
            ))}
          </div>
          <p className="text-[11px] text-gray-600 mt-3 font-medium flex items-center gap-1.5">
            Family: <span className="text-gray-900 font-semibold">{selectedShade.label}</span>
          </p>
        </div>
      )}

      {/* Spacing filler if custom menu isn't open */}
      {selectedOption !== "shade" && <div className="flex-1" />}

      {/* Generate Action */}
      <Button
        onClick={handleGenerateClick}
        disabled={!selectedOption || generateStatus === "generating"}
        className="w-full h-11 text-sm font-semibold shadow-lg shadow-primary/20 mt-auto"
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