"use client";
import { Palette, Sofa, Zap } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  RiDice1Line,
  RiMoonFill,
  RiSparkling2Line,
  RiSunFill,
  RiDiceLine,
} from "react-icons/ri";

interface PaintColor {
  ral: string;
  hex: string;
  name: string;
  variant?: string;
}

interface BookingParams {
  id?: string;
  phone: string;
  paint_colors?: PaintColor[];
}

interface ComponentProps {
  booking: BookingParams;
  hasGeneratedImage: boolean;
}

export default function AlternateDesign({
  booking,
  hasGeneratedImage,
}: ComponentProps) {
  const [removeFurniture, setRemoveFurniture] = useState(false);
  const [selectedOption, setSelectedOption] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const options = [
    { id: "brighter", icon: RiSunFill, label: "Brighten" },
    { id: "darker", icon: RiMoonFill, label: "Darken" },
    { id: "trendy", icon: RiSparkling2Line, label: "Trendy" },
    { id: "random", icon: RiDiceLine, label: "Random" },
  ];

  const handleSelectOption = (optionId: string) => {
    if (hasGeneratedImage) return;
    setSelectedOption(selectedOption === optionId ? "" : optionId);
  };

  const handleGenerateNewMockUp = async () => {
    if (!selectedOption || hasGeneratedImage) return;

    setIsGenerating(true);
    try {
      const response = await fetch(
        `/api/booking/${booking.phone}/generate-mockup`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            bookingId: booking.id,
            option: selectedOption,
            removeFurniture: removeFurniture,
            currentColor: booking.paint_colors
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to generate mockup");
      }

      const data = await response.json();
      console.log("Mockup generated:", data);
    } catch (error) {
      console.error("Error generating mockup:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="bg-white rounded-xl p-4 md:p-6 border border-primary/10">
      <div className="flex items-center gap-2 mb-4">
        <Palette className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold">Alternate Design Options</h3>
      </div>

      <div className="border-t border-primary/10 pt-6 mt-6">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-sm font-semibold flex items-center gap-2">
            <Zap className="h-4 w-4 text-primary" />
            HUE-LINE ENGINE
          </h4>
        </div>

        <p className="text-sm text-muted-foreground mb-4">
          Select an option below and generate a new mockup instantly.
        </p>

        <div className="flex flex-col md:flex-row gap-6 mb-6">
          <div className="flex flex-col md:max-w-sm p-4 bg-background/60 rounded-lg border border-primary/50 relative">
            <div className="absolute -top-2 -left-2 px-2 py-1 bg-blue-500 text-white text-xs font-bold rounded-md shadow-sm">
              BETA
            </div>

            <div className="flex items-center justify-center gap-3">
              <Sofa className="h-4 w-4 text-primary" />
              <Label
                htmlFor="remove-furniture-gallery"
                className="text-sm font-medium"
              >
                Remove Furniture From Mockup
              </Label>
              <Switch
                id="remove-furniture-gallery"
                checked={removeFurniture}
                onCheckedChange={setRemoveFurniture}
                disabled={hasGeneratedImage}
                className="mt-0.5"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mb-6">
          {options.map((option) => {
            const Icon = option.icon;
            return (
              <Button
                key={option.id}
                onClick={() => handleSelectOption(option.id)}
                disabled={hasGeneratedImage}
                variant={selectedOption === option.id ? "default" : "outline"}
                className="relative flex flex-col items-center justify-center gap-2 h-28 py-4 transition-color duration-200"
              >
                {option.id === "trendy" && (
                  <Badge className="absolute top-2 right-2 bg-orange-400 animate-pulse">
                    Hot
                  </Badge>
                )}
                <Icon className="h-6 w-6" />
                <span className="text-sm font-medium">{option.label}</span>
              </Button>
            );
          })}
        </div>

        <div className="flex justify-center mb-1">
          <Button
            onClick={handleGenerateNewMockUp}
            disabled={!selectedOption || isGenerating || hasGeneratedImage}
            size="lg"
            className="group inline-flex items-center gap-2 px-6"
          >
            <Zap className="h-3 w-3 group-hover:scale-110 transition-transform" />
            {hasGeneratedImage
              ? "Already Generated"
              : isGenerating
              ? "Generating..."
              : "Generate Mockup"}
          </Button>
        </div>
      </div>
    </div>
  );
}
